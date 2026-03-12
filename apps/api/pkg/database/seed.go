package database

import (
	"log/slog"
	"os"

	"github.com/jmoiron/sqlx"
)

// RunSeedIfEmpty runs the seed SQL file only when the products table is empty.
func RunSeedIfEmpty(db *sqlx.DB, seedPath string) error {
	var count int
	if err := db.Get(&count, "SELECT COUNT(*) FROM products"); err != nil {
		return err
	}
	if count > 0 {
		slog.Info("seed skipped, data already exists", "products", count)
		return nil
	}

	sql, err := os.ReadFile(seedPath)
	if err != nil {
		return err
	}

	if _, err := db.Exec(string(sql)); err != nil {
		return err
	}

	slog.Info("seed data applied", "file", seedPath)
	return nil
}
