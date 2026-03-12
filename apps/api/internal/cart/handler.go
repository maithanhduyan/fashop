package cart

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	c := rg.Group("/cart")
	{
		c.GET("", h.GetCart)
		c.POST("", h.AddItem)
		c.PUT("/:id", h.UpdateItem)
		c.DELETE("/:id", h.RemoveItem)
		c.DELETE("", h.ClearCart)
	}
}

func (h *Handler) GetCart(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	cart, err := h.repo.GetCart(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, cart)
}

func (h *Handler) AddItem(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	var req AddItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.repo.AddItem(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *Handler) UpdateItem(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	itemID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	var req UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.repo.UpdateQuantity(c.Request.Context(), userID, itemID, req.Quantity)
	if errors.Is(err, ErrItemNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *Handler) RemoveItem(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	itemID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	if err := h.repo.RemoveItem(c.Request.Context(), userID, itemID); err != nil {
		if errors.Is(err, ErrItemNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *Handler) ClearCart(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	if err := h.repo.Clear(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
