-- ============================================
-- Mifgash Hateomim Restaurant System Database
-- Compatible with MySQL / MariaDB / XAMPP phpMyAdmin
-- Charset: utf8mb4 for Hebrew + Arabic support
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS mifgash_hateomim;
CREATE DATABASE mifgash_hateomim
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mifgash_hateomim;

-- ============================================
-- 1) ADMIN USERS
-- ============================================
CREATE TABLE admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2) CATEGORIES
-- ============================================
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name_he VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3) PRODUCTS
-- ============================================
CREATE TABLE products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  name_he VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  description_he TEXT DEFAULT NULL,
  description_ar TEXT DEFAULT NULL,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_url VARCHAR(255) DEFAULT NULL,
  prep_time_minutes INT NOT NULL DEFAULT 15,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category_id (category_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4) OPTION GROUPS (for product add-ons)
-- ============================================
CREATE TABLE option_groups (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  name_he VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  selection_type ENUM('single','multiple') NOT NULL DEFAULT 'single',
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  min_select INT NOT NULL DEFAULT 0,
  max_select INT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_option_groups_product_id (product_id),
  CONSTRAINT fk_option_groups_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5) OPTION ITEMS
-- ============================================
CREATE TABLE option_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_id INT UNSIGNED NOT NULL,
  name_he VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  price_change DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_option_items_group_id (group_id),
  CONSTRAINT fk_option_items_group
    FOREIGN KEY (group_id) REFERENCES option_groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6) ORDERS
-- ============================================
CREATE TABLE orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL,
  order_type ENUM('delivery','pickup') NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  notes TEXT DEFAULT NULL,
  language ENUM('he','ar') NOT NULL DEFAULT 'he',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method ENUM('online','cash') NOT NULL,
  payment_status ENUM('pending','paid','unpaid','failed') NOT NULL DEFAULT 'unpaid',
  order_status ENUM('new','confirmed','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'new',
  invoice_generated TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_status (order_status),
  KEY idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7) ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  product_name_he VARCHAR(150) NOT NULL,
  product_name_ar VARCHAR(150) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  item_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8) ORDER ITEM OPTIONS
-- ============================================
CREATE TABLE order_item_options (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_item_id INT UNSIGNED NOT NULL,
  group_name_he VARCHAR(150) NOT NULL,
  group_name_ar VARCHAR(150) NOT NULL,
  option_name_he VARCHAR(150) NOT NULL,
  option_name_ar VARCHAR(150) NOT NULL,
  price_change DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_item_options_order_item_id (order_item_id),
  CONSTRAINT fk_order_item_options_order_item
    FOREIGN KEY (order_item_id) REFERENCES order_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9) BUSINESS HOURS (weekly regular schedule)
-- ============================================
CREATE TABLE business_hours (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday',
  is_open TINYINT(1) NOT NULL DEFAULT 1,
  open_time TIME DEFAULT NULL,
  close_time TIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_business_hours_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10) SPECIAL CLOSURES / SPECIAL OPEN HOURS
-- ============================================
CREATE TABLE special_closures (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  special_date DATE NOT NULL,
  is_closed TINYINT(1) NOT NULL DEFAULT 1,
  open_time TIME DEFAULT NULL,
  close_time TIME DEFAULT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_special_closures_special_date (special_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11) BUSINESS SETTINGS
-- ============================================
CREATE TABLE business_settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_name_he VARCHAR(150) NOT NULL,
  restaurant_name_ar VARCHAR(150) NOT NULL,
  default_language ENUM('he','ar') NOT NULL DEFAULT 'he',
  currency VARCHAR(10) NOT NULL DEFAULT 'ILS',
  delivery_enabled TINYINT(1) NOT NULL DEFAULT 1,
  pickup_enabled TINYINT(1) NOT NULL DEFAULT 1,
  manual_override_mode ENUM('auto','force_open','force_closed') NOT NULL DEFAULT 'auto',
  manual_override_note VARCHAR(255) DEFAULT NULL,
  menu_mode TINYINT(1) NOT NULL DEFAULT 0,
  phone_number VARCHAR(30) DEFAULT NULL,
  whatsapp_number VARCHAR(30) DEFAULT NULL,
  address_he VARCHAR(255) DEFAULT NULL,
  address_ar VARCHAR(255) DEFAULT NULL,
  lat DECIMAL(10,8) DEFAULT NULL,
  lng DECIMAL(11,8) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12) PAYMENTS
-- ============================================
CREATE TABLE payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  provider VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(150) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  raw_response LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_order_id (order_id),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13) INVOICES
-- ============================================
CREATE TABLE invoices (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  provider VARCHAR(100) DEFAULT NULL,
  document_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_order_id (order_id),
  UNIQUE KEY uq_invoices_invoice_number (invoice_number),
  CONSTRAINT fk_invoices_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14) PRODUCT AVAILABILITY LOG (optional but useful)
-- ============================================
CREATE TABLE product_availability_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  changed_by_admin_id INT UNSIGNED DEFAULT NULL,
  old_is_available TINYINT(1) NOT NULL,
  new_is_available TINYINT(1) NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_availability_logs_product_id (product_id),
  CONSTRAINT fk_product_availability_logs_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_product_availability_logs_admin
    FOREIGN KEY (changed_by_admin_id) REFERENCES admin_users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO admin_users (username, password_hash, full_name)
VALUES
('admin', '$2b$10$replace_this_with_real_bcrypt_hash', 'Main Admin');

INSERT INTO business_settings (
  restaurant_name_he,
  restaurant_name_ar,
  default_language,
  currency,
  delivery_enabled,
  pickup_enabled,
  manual_override_mode,
  manual_override_note,
  menu_mode,
  phone_number,
  address_he,
  address_ar
)
VALUES
('מפגש התאומים', 'ملتقى التوأم', 'he', 'ILS', 1, 1, 'auto', NULL, 0, '050-0000000', 'כתובת העסק', 'عنوان العمل');

INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
VALUES
(0, 1, '10:00:00', '23:00:00'),
(1, 1, '10:00:00', '23:00:00'),
(2, 1, '10:00:00', '23:00:00'),
(3, 1, '10:00:00', '23:00:00'),
(4, 1, '10:00:00', '23:00:00'),
(5, 1, '10:00:00', '23:00:00'),
(6, 1, '10:00:00', '23:00:00');

INSERT INTO categories (name_he, name_ar, image_url, sort_order, is_active)
VALUES
('פיצה', 'بيتزا', '/images/categories/pizza.jpg', 1, 1),
('בגטים', 'باغيت', '/images/categories/baguettes.jpg', 2, 1),
('עראיס', 'عرايس', '/images/categories/arayes.jpg', 3, 1),
('המבורגר', 'همبرغر', '/images/categories/burgers.jpg', 4, 1),
('תוספות ושתייה', 'إضافات ومشروبات', '/images/categories/extras.jpg', 5, 1);

INSERT INTO products (
  category_id, name_he, name_ar, description_he, description_ar,
  base_price, image_url, prep_time_minutes, is_active, is_available
)
VALUES
(1, 'פיצה משפחתית', 'بيتزا عائلية', 'רוטב עגבניות, גבינה ותוספות לבחירה', 'صلصة بندورة، جبنة وإضافات حسب الاختيار', 55.00, '/images/products/family-pizza.jpg', 20, 1, 1),
(2, 'באגט שניצל', 'باغيت شنيتسل', 'באגט חם עם שניצל, סלטים ורטבים', 'باغيت ساخن مع شنيتسل، سلطات وصلصات', 36.00, '/images/products/schnitzel-baguette.jpg', 12, 1, 1),
(3, 'עראיס בשר', 'عرايس لحم', 'פיתה קלויה ממולאת בבשר מתובל', 'خبز محشو باللحم المتبل', 42.00, '/images/products/arayes-meat.jpg', 15, 1, 1),
(4, 'המבורגר קלאסי', 'همبرغر كلاسيكي', 'המבורגר עסיסי בלחמניה עם ירקות ורטבים', 'همبرغر طازج داخل خبز مع خضار وصلصات', 48.00, '/images/products/classic-burger.jpg', 15, 1, 1),
(5, 'צ׳יפס', 'بطاطا مقلية', 'מנת צ׳יפס פריכה', 'وجبة بطاطا مقلية مقرمشة', 15.00, '/images/products/fries.jpg', 8, 1, 1),
(5, 'קולה', 'كولا', 'פחית קולה קרה', 'علبة كولا باردة', 8.00, '/images/products/cola.jpg', 1, 1, 1);

-- ============================================
-- OPTION GROUPS + ITEMS FOR PRODUCTS
-- ============================================

-- For Pizza (product_id assumed 1)
INSERT INTO option_groups (product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active)
VALUES
(1, 'גודל', 'الحجم', 'single', 1, 1, 1, 1, 1),
(1, 'תוספות לפיצה', 'إضافات للبيتزا', 'multiple', 0, 0, 5, 2, 1);

INSERT INTO option_items (group_id, name_he, name_ar, price_change, sort_order, is_active)
VALUES
(1, 'רגיל', 'عادي', 0.00, 1, 1),
(1, 'משפחתי גדול', 'عائلي كبير', 12.00, 2, 1),
(2, 'זיתים', 'زيتون', 4.00, 1, 1),
(2, 'פטריות', 'فطر', 4.00, 2, 1),
(2, 'בצל', 'بصل', 4.00, 3, 1),
(2, 'תירס', 'ذرة', 4.00, 4, 1),
(2, 'בולגרית', 'جبنة بلغارية', 6.00, 5, 1);

-- For Schnitzel Baguette (product_id assumed 2)
INSERT INTO option_groups (product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active)
VALUES
(2, 'רטבים', 'الصلصات', 'multiple', 0, 0, 3, 1, 1),
(2, 'חריף', 'حار', 'single', 0, 0, 1, 2, 1);

INSERT INTO option_items (group_id, name_he, name_ar, price_change, sort_order, is_active)
VALUES
(3, 'קטשופ', 'كاتشب', 0.00, 1, 1),
(3, 'מיונז', 'مايونيز', 0.00, 2, 1),
(3, 'שום', 'ثوم', 0.00, 3, 1),
(4, 'בלי חריף', 'بدون حار', 0.00, 1, 1),
(4, 'חריף', 'حار', 0.00, 2, 1);

-- For Arayes (product_id assumed 3)
INSERT INTO option_groups (product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active)
VALUES
(3, 'תוספת בצד', 'إضافة جانبية', 'single', 0, 0, 1, 1, 1);

INSERT INTO option_items (group_id, name_he, name_ar, price_change, sort_order, is_active)
VALUES
(5, 'בלי תוספת', 'بدون إضافة', 0.00, 1, 1),
(5, 'צ׳יפס', 'بطاطا مقلية', 8.00, 2, 1),
(5, 'שתייה', 'مشروب', 6.00, 3, 1);

-- For Burger (product_id assumed 4)
INSERT INTO option_groups (product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active)
VALUES
(4, 'דרגת עשייה', 'درجة الاستواء', 'single', 1, 1, 1, 1, 1),
(4, 'תוספות להמבורגר', 'إضافات للهمبرغر', 'multiple', 0, 0, 4, 2, 1),
(4, 'תוספת בצד', 'إضافة جانبية', 'single', 0, 0, 1, 3, 1);

INSERT INTO option_items (group_id, name_he, name_ar, price_change, sort_order, is_active)
VALUES
(6, 'מדיום', 'ميديوم', 0.00, 1, 1),
(6, 'וול דאן', 'ويل دان', 0.00, 2, 1),
(7, 'גבינה', 'جبنة', 5.00, 1, 1),
(7, 'ביצת עין', 'بيضة', 6.00, 2, 1),
(7, 'בצל מקורמל', 'بصل مكرمل', 4.00, 3, 1),
(7, 'פטריות', 'فطر', 4.00, 4, 1),
(8, 'בלי תוספת', 'بدون إضافة', 0.00, 1, 1),
(8, 'צ׳יפס', 'بطاطا مقلية', 8.00, 2, 1),
(8, 'טבעות בצל', 'حلقات بصل', 10.00, 3, 1);

-- ============================================
-- SAMPLE ORDER
-- ============================================
INSERT INTO orders (
  order_number, order_type, customer_name, customer_phone, notes, language,
  subtotal, delivery_fee, total_amount, payment_method, payment_status,
  order_status, invoice_generated
)
VALUES
('MH-1001', 'delivery', 'לקוח לדוגמה', '0500000000', 'בלי בצל', 'he', 61.00, 0.00, 61.00, 'cash', 'unpaid', 'new', 0);

INSERT INTO order_items (
  order_id, product_id, product_name_he, product_name_ar, base_price, quantity, item_total, notes
)
VALUES
(1, 4, 'המבורגר קלאסי', 'همبرغر كلاسيكي', 48.00, 1, 61.00, 'בלי בצל טרי');

INSERT INTO order_item_options (
  order_item_id, group_name_he, group_name_ar, option_name_he, option_name_ar, price_change
)
VALUES
(1, 'דרגת עשייה', 'درجة الاستواء', 'מדיום', 'ميديوم', 0.00),
(1, 'תוספות להמבורגר', 'إضافات للهمبرغر', 'גבינה', 'جبنة', 5.00),
(1, 'תוספת בצד', 'إضافة جانبية', 'צ׳יפס', 'بطاطا مقلية', 8.00);

SET FOREIGN_KEY_CHECKS = 1;
