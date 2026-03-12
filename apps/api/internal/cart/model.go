package cart

import "time"

type CartItem struct {
	ID        int64     `db:"id" json:"id"`
	UserID    int64     `db:"user_id" json:"-"`
	ProductID int64     `db:"product_id" json:"product_id"`
	Quantity  int       `db:"quantity" json:"quantity"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
	// Joined from products
	ProductName  string  `db:"product_name" json:"product_name"`
	ProductSlug  string  `db:"product_slug" json:"product_slug"`
	ProductPrice int64   `db:"product_price" json:"product_price"`
	ProductImage *string `db:"product_image" json:"product_image"`
}

type AddItemRequest struct {
	ProductID int64 `json:"product_id" binding:"required"`
	Quantity  int   `json:"quantity" binding:"required,min=1,max=99"`
}

type UpdateItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1,max=99"`
}

type CartResponse struct {
	Items []CartItem `json:"items"`
	Total int64      `json:"total"`
}
