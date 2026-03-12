-- Fashop Demo Seed Data
-- Run: docker exec -i fashop-postgres psql -U fashop -d fashop < apps/api/seeds/seed_demo.sql

-- Clear existing data (respects FK order)
TRUNCATE order_items, orders, cart_items, products, categories RESTART IDENTITY CASCADE;

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug) VALUES
  ('Áo nam',        'ao-nam'),
  ('Quần nam',      'quan-nam'),
  ('Áo nữ',         'ao-nu'),
  ('Váy & Đầm',     'vay-dam'),
  ('Giày dép',      'giay-dep'),
  ('Túi xách',      'tui-xach'),
  ('Phụ kiện',      'phu-kien'),
  ('Đồ thể thao',   'do-the-thao');

-- ============ PRODUCTS ============

-- Áo nam (category_id = 1)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Áo Polo Classic Trắng',
  'ao-polo-classic-trang',
  'Áo polo nam chất liệu cotton cao cấp, form regular fit thoải mái. Cổ bẻ lịch lãm, phù hợp đi làm và dạo phố.',
  349000, 1,
  ARRAY['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80'],
  'active'
),
(
  'Áo Thun Basic Đen',
  'ao-thun-basic-den',
  'Áo thun nam cổ tròn basic, chất cotton 100% mềm mịn. Thiết kế tối giản dễ phối đồ, mặc hàng ngày thoải mái.',
  199000, 1,
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
  'active'
),
(
  'Áo Sơ Mi Oxford Xanh',
  'ao-so-mi-oxford-xanh',
  'Áo sơ mi nam chất liệu Oxford dày dặn, màu xanh navy thanh lịch. Phù hợp đi làm, dự tiệc và hẹn hò.',
  459000, 1,
  ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
  'active'
),
(
  'Áo Hoodie Oversize',
  'ao-hoodie-oversize',
  'Hoodie unisex form oversize, chất nỉ bông dày ấm. Mũ trùm đầu có dây rút, túi kangaroo phía trước.',
  529000, 1,
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80'],
  'active'
);

-- Quần nam (category_id = 2)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Quần Jean Slim Fit Xanh Đậm',
  'quan-jean-slim-fit-xanh-dam',
  'Quần jean nam slim fit, chất denim co giãn thoải mái. Màu xanh đậm classic, phối được nhiều kiểu áo.',
  599000, 2,
  ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
  'active'
),
(
  'Quần Kaki Slim Kem',
  'quan-kaki-slim-kem',
  'Quần kaki nam dáng slim, chất vải kaki cotton mềm mại. Màu kem thanh lịch, phù hợp công sở và casual.',
  449000, 2,
  ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'],
  'active'
),
(
  'Quần Short Thể Thao',
  'quan-short-the-thao',
  'Quần short nam thể thao, chất liệu polyester thoáng khí. Lưng thun co giãn, thích hợp tập gym và chạy bộ.',
  279000, 2,
  ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80'],
  'active'
);

-- Áo nữ (category_id = 3)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Áo Blouse Lụa Trắng',
  'ao-blouse-lua-trang',
  'Áo blouse nữ chất lụa mềm rủ, màu trắng tinh khôi. Cổ V thanh lịch, tay dài nhẹ nhàng nữ tính.',
  399000, 3,
  ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80'],
  'active'
),
(
  'Áo Croptop Thể Thao',
  'ao-croptop-the-thao',
  'Áo croptop nữ phong cách sporty, chất thun co giãn 4 chiều. Form ôm khoe eo, thoáng mát khi vận động.',
  249000, 3,
  ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80'],
  'active'
),
(
  'Áo Len Nữ Beige',
  'ao-len-nu-beige',
  'Áo len nữ dệt kim mềm mại, màu beige ấm áp. Form regular fit, phù hợp thời tiết se lạnh và phối layer.',
  479000, 3,
  ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'],
  'active'
);

-- Váy & Đầm (category_id = 4)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Đầm Midi Hoa Nhí',
  'dam-midi-hoa-nhi',
  'Đầm midi nữ họa tiết hoa nhí vintage, chất voan mềm mại thoáng mát. Eo co giãn, chân váy xoè nhẹ nhàng.',
  659000, 4,
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
  'active'
),
(
  'Chân Váy Dài Xếp Li',
  'chan-vay-dai-xep-li',
  'Chân váy dài xếp li thanh lịch, chất vải rủ mềm mại. Lưng thun thoải mái, phù hợp đi làm và dạo phố.',
  489000, 4,
  ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'],
  'active'
),
(
  'Váy Liền Công Sở',
  'vay-lien-cong-so',
  'Váy liền thân trang nhã, chất liệu polyester cao cấp ít nhăn. Dáng chữ A tôn vóc dáng, thanh lịch nơi công sở.',
  729000, 4,
  ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
  'active'
);

-- Giày dép (category_id = 5)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Giày Sneaker Trắng Classic',
  'giay-sneaker-trang-classic',
  'Giày sneaker unisex màu trắng classic, đế cao su chống trượt. Thiết kế tối giản dễ phối, êm chân cả ngày dài.',
  899000, 5,
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
  'active'
),
(
  'Giày Boot Da Nâu',
  'giay-boot-da-nau',
  'Giày boot nam da bò thật, màu nâu vintage nam tính. Đế cao su bền bỉ, phong cách streetwear cá tính.',
  1290000, 5,
  ARRAY['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80'],
  'active'
),
(
  'Dép Sandal Đế Bằng',
  'dep-sandal-de-bang',
  'Dép sandal nữ đế bằng thoải mái, quai da mềm êm chân. Phù hợp đi biển, đi dạo và mặc thường ngày.',
  359000, 5,
  ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'],
  'active'
);

-- Túi xách (category_id = 6)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Túi Tote Da Nâu',
  'tui-tote-da-nau',
  'Túi tote da PU cao cấp, dung tích lớn đựng được laptop 14 inch. Quai xách chắc chắn, thiết kế thanh lịch.',
  789000, 6,
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
  'active'
),
(
  'Ba Lô Thời Trang Đen',
  'ba-lo-thoi-trang-den',
  'Ba lô unisex chống nước, ngăn laptop riêng biệt. Quai vai đệm êm, nhiều ngăn tiện dụng cho đi học, đi làm.',
  659000, 6,
  ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
  'active'
);

-- Phụ kiện (category_id = 7)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Đồng Hồ Minimalist Bạc',
  'dong-ho-minimalist-bac',
  'Đồng hồ unisex mặt tròn minimalist, dây thép không gỉ màu bạc. Kính sapphire chống xước, chống nước 3ATM.',
  1490000, 7,
  ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80'],
  'active'
),
(
  'Kính Mát Retro Đen',
  'kinh-mat-retro-den',
  'Kính mát phong cách retro, gọng acetate bền nhẹ. Tròng kính chống UV400, bảo vệ mắt tối đa.',
  389000, 7,
  ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'],
  'active'
),
(
  'Mũ Bucket Unisex',
  'mu-bucket-unisex',
  'Mũ bucket cotton mềm mại, phong cách đường phố. Vành rộng che nắng tốt, có thể gấp gọn dễ mang theo.',
  199000, 7,
  ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80'],
  'active'
);

-- Đồ thể thao (category_id = 8)
INSERT INTO products (name, slug, description, price, category_id, image_urls, status) VALUES
(
  'Áo Thể Thao Dri-Fit',
  'ao-the-thao-dri-fit',
  'Áo thể thao nam công nghệ thấm hút mồ hôi, chất liệu polyester thoáng khí. Form regular fit thoải mái vận động.',
  329000, 8,
  ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'],
  'active'
),
(
  'Quần Jogger Nỉ Xám',
  'quan-jogger-ni-xam',
  'Quần jogger nỉ bông dày dặn, lưng thun co giãn với dây rút. Bo gấu tiện lợi, phù hợp tập gym và mặc hàng ngày.',
  429000, 8,
  ARRAY['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80'],
  'active'
),
(
  'Giày Chạy Bộ Ultra',
  'giay-chay-bo-ultra',
  'Giày chạy bộ đế foam siêu nhẹ, lưới thoáng khí. Đệm gót chống sốc, phù hợp chạy bộ đường dài và tập luyện.',
  1190000, 8,
  ARRAY['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'],
  'active'
);

-- Done! Total: 8 categories, 24 products
