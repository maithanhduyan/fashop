package main

import (
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/tiach/fashop-api/internal/auth"
	"github.com/tiach/fashop-api/internal/cart"
	"github.com/tiach/fashop-api/internal/order"
	"github.com/tiach/fashop-api/internal/product"
	"github.com/tiach/fashop-api/pkg/config"
	"github.com/tiach/fashop-api/pkg/database"
	"github.com/tiach/fashop-api/pkg/middleware"
)

func main() {
	// Structured logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	// Load config
	cfg := config.Load()

	// Database connections
	db, err := database.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	slog.Info("connected to postgres")

	// Run migrations
	if err := database.RunMigrations(db, "migrations"); err != nil {
		slog.Error("failed to run migrations", "error", err)
		os.Exit(1)
	}

	rdb, err := database.NewRedis(cfg.RedisURL)
	if err != nil {
		slog.Error("failed to connect to redis", "error", err)
		os.Exit(1)
	}
	defer rdb.Close()
	slog.Info("connected to redis")

	// Auth module
	jwtManager := auth.NewJWTManager(cfg.JWTSecret)
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, jwtManager)
	authHandler := auth.NewHandler(authService)

	// Product module
	catRepo := product.NewCategoryRepository(db)
	productRepo := product.NewRepository(db)
	productHandler := product.NewHandler(productRepo, catRepo)

	// Cart module
	cartRepo := cart.NewRepository(db)
	cartHandler := cart.NewHandler(cartRepo)

	// Order module
	orderRepo := order.NewRepository(db)
	orderHandler := order.NewHandler(orderRepo)

	// Gin setup
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"db":     db.Ping() == nil,
			"redis":  rdb.Ping(c.Request.Context()).Err() == nil,
		})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")
	authHandler.RegisterRoutes(v1)
	productHandler.RegisterRoutes(v1)

	// Protected routes (authenticated users)
	protected := v1.Group("")
	protected.Use(middleware.JWTAuth(jwtManager))
	authHandler.RegisterProtectedRoutes(protected)
	cartHandler.RegisterRoutes(protected)
	orderHandler.RegisterRoutes(protected)

	// Admin routes (authenticated + admin role)
	admin := v1.Group("/admin")
	admin.Use(middleware.JWTAuth(jwtManager))
	admin.Use(middleware.RequireRole("admin"))
	productHandler.RegisterAdminRoutes(admin)
	orderHandler.RegisterAdminRoutes(admin)

	// Start server
	slog.Info("starting server", "port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		slog.Error("server failed", "error", err)
		os.Exit(1)
	}
}
