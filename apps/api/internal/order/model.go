package order

import "time"

type Order struct {
	ID              int64       `db:"id" json:"id"`
	UserID          int64       `db:"user_id" json:"user_id"`
	Status          string      `db:"status" json:"status"`
	Total           int64       `db:"total" json:"total"`
	ShippingName    string      `db:"shipping_name" json:"shipping_name"`
	ShippingPhone   string      `db:"shipping_phone" json:"shipping_phone"`
	ShippingAddress string      `db:"shipping_address" json:"shipping_address"`
	Note            *string     `db:"note" json:"note"`
	CreatedAt       time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time   `db:"updated_at" json:"updated_at"`
	Items           []OrderItem `db:"-" json:"items,omitempty"`
}

type OrderItem struct {
	ID        int64     `db:"id" json:"id"`
	OrderID   int64     `db:"order_id" json:"order_id"`
	ProductID int64     `db:"product_id" json:"product_id"`
	Name      string    `db:"name" json:"name"`
	Price     int64     `db:"price" json:"price"`
	Quantity  int       `db:"quantity" json:"quantity"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type CheckoutRequest struct {
	ShippingName    string  `json:"shipping_name" binding:"required,max=255"`
	ShippingPhone   string  `json:"shipping_phone" binding:"required,max=20"`
	ShippingAddress string  `json:"shipping_address" binding:"required"`
	Note            *string `json:"note"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed shipping delivered cancelled"`
}

type ListParams struct {
	Page   int    `form:"page,default=1" binding:"min=1"`
	Limit  int    `form:"limit,default=20" binding:"min=1,max=100"`
	Status string `form:"status"`
}

func (p *ListParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

type PaginatedResponse struct {
	Data       []Order `json:"data"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	TotalPages int     `json:"total_pages"`
}
