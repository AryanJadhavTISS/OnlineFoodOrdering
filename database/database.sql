CREATE DATABASE IF NOT EXISTS OnlineFoodOrdering;

USE OnlineFoodOrdering;

CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    state VARCHAR(100),
    city VARCHAR(100),
    full_address TEXT,
    pincode VARCHAR(10)
);

CREATE TABLE Restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    state VARCHAR(100),
    city VARCHAR(100),
    full_address TEXT,
    pincode VARCHAR(10)
);

CREATE TABLE MenuItems (
    menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants (restaurant_id)
);

CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants (restaurant_id),
    FOREIGN KEY (customer_id) REFERENCES Customers (customer_id)
);

CREATE TABLE Order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders (order_id),
    FOREIGN KEY (menu_item_id) REFERENCES MenuItems (menu_item_id)
);

USE OnlineFoodOrdering;

INSERT INTO
    Customers (
        name,
        email,
        phone,
        state,
        city,
        full_address,
        pincode
    )
VALUES
    (
        'Aryan Jadhav',
        'aryan@gmail.com',
        '9876543210',
        'Maharashtra',
        'Mumbai',
        'Flat 402, Sai Residency, MG Road, Andheri West, Near City Mall',
        '400053'
    ),
    (
        'Rahul Sharma',
        'rahul@gmail.com',
        '9876543211',
        'Maharashtra',
        'Pune',
        'Flat 203, Green Valley Apartments, Baner Road, Near Jupiter Hospital',
        '411045'
    ),
    (
        'Priya Patil',
        'priya@gmail.com',
        '9876543212',
        'Maharashtra',
        'Thane',
        'B-12, Shree Complex, Ghodbunder Road, Near Hiranandani Estate',
        '400607'
    ),
    (
        'Sneha Kulkarni',
        'sneha@gmail.com',
        '9876543213',
        'Maharashtra',
        'Navi Mumbai',
        'Flat 501, Palm Heights, Sector 15, CBD Belapur',
        '400614'
    ),
    (
        'Amit Shah',
        'amit@gmail.com',
        '9876543214',
        'Gujarat',
        'Ahmedabad',
        'House 24, Shanti Nagar, Satellite Road, Near Iscon Circle',
        '380015'
    ),
    (
        'Neha Deshmukh',
        'neha@gmail.com',
        '9876543215',
        'Maharashtra',
        'Nagpur',
        'Flat 302, Sai Enclave, Dharampeth, Near Ambazari Garden',
        '440010'
    ),
    (
        'Karan Mehta',
        'karan@gmail.com',
        '9876543216',
        'Karnataka',
        'Bengaluru',
        'Flat 701, Prestige Apartments, Whitefield Main Road',
        '560066'
    ),
    (
        'Ananya Verma',
        'ananya@gmail.com',
        '9876543217',
        'Delhi',
        'New Delhi',
        'House 18, Block C, Lajpat Nagar, Near Central Market',
        '110024'
    );

INSERT INTO
    Restaurants (
        name,
        email,
        phone,
        state,
        city,
        full_address,
        pincode
    )
VALUES
    (
        'Pizza Palace',
        'pizza@gmail.com',
        '9000000001',
        'Maharashtra',
        'Mumbai',
        'Shop 12, Linking Road, Bandra West, Near Bandra Station',
        '400050'
    ),
    (
        'Burger House',
        'burger@gmail.com',
        '9000000002',
        'Maharashtra',
        'Pune',
        'Shop 5, FC Road, Shivajinagar, Near Fergusson College',
        '411004'
    ),
    (
        'Spice Garden',
        'spice@gmail.com',
        '9000000003',
        'Maharashtra',
        'Thane',
        'Shop 8, Hiranandani Estate, Ghodbunder Road',
        '400607'
    ),
    (
        'The Italian Kitchen',
        'italian@gmail.com',
        '9000000004',
        'Karnataka',
        'Bengaluru',
        'No. 24, Indiranagar 100 Feet Road, Near Metro Station',
        '560038'
    ),
    (
        'Tandoori Nights',
        'tandoori@gmail.com',
        '9000000005',
        'Delhi',
        'New Delhi',
        'Shop 15, Connaught Place, Inner Circle',
        '110001'
    );

INSERT INTO
    MenuItems (restaurant_id, name, description, price, category)
VALUES
    (
        1,
        'Margharita Pizza',
        'Classic cheese pizza with tomato sauce',
        200,
        'Pizza'
    ),
    (
        1,
        'Farmhouse Pizza',
        'Pizza topped with fresh vegetables',
        300,
        'Pizza'
    ),
    (
        1,
        'Garlic Bread',
        'Toasted bread with garlic butter',
        120,
        'Sides'
    ),
    (
        2,
        'Veg Burger',
        'Vegetable patty with fresh lettuce',
        150.00,
        'Burger'
    ),
    (
        2,
        'Cheese Burger',
        'Burger with double cheese',
        220.00,
        'Burger'
    ),
    (
        2,
        'French Fries',
        'Crispy salted potato fries',
        100.00,
        'Sides'
    ),
    (
        3,
        'Paneer Tikka',
        'Grilled cottage cheese with spices',
        250.00,
        'Starters'
    ),
    (
        3,
        'Veg Biryani',
        'Aromatic rice with vegetables',
        220.00,
        'Main Course'
    ),
    (
        3,
        'Butter Naan',
        'Soft Indian bread with butter',
        50.00,
        'Breads'
    ),
    (
        4,
        'Pasta Alfredo',
        'Creamy white sauce pasta',
        280.00,
        'Pasta'
    ),
    (
        4,
        'Lasagna',
        'Layered pasta with cheese and sauce',
        350.00,
        'Pasta'
    ),
    (
        4,
        'Tiramisu',
        'Classic Italian coffee dessert',
        180.00,
        'Dessert'
    ),
    (
        5,
        'Paneer Tikka',
        'Tandoori grilled paneer cubes',
        260.00,
        'Starters'
    ),
    (
        5,
        'Chicken Tandoori',
        'Traditional roasted tandoori chicken',
        380.00,
        'Main Course'
    ),
    (
        5,
        'Butter Chicken',
        'Chicken cooked in creamy tomato gravy',
        320.00,
        'Main Course'
    );

INSERT INTO
    Orders (restaurant_id, customer_id, total_amount, status)
VALUES
    (1, 1, 500.00, 'Pending'),
    (2, 2, 370.00, 'Confirmed'),
    (3, 3, 520.00, 'Preparing'),
    (4, 4, 630.00, 'Delivered'),
    (5, 5, 700.00, 'Cancelled');

INSERT INTO
    Order_items (order_id, menu_item_id, quantity, price)
VALUES
    (1, 1, 1, 200.00),
    (1, 2, 1, 300.00),
    (2, 4, 1, 150.00),
    (2, 6, 1, 100.00),
    (2, 5, 1, 120.00),
    (3, 7, 1, 250.00),
    (3, 8, 1, 220.00),
    (3, 9, 1, 50.00),
    (4, 10, 1, 280.00),
    (4, 11, 1, 350.00),
    (5, 13, 1, 260.00),
    (5, 14, 1, 380.00),
    (5, 15, 1, 320.00);

-- The application preserves the existing schema. Order_items.price is the
-- unit price captured when the order was placed; subtotal is quantity * price.
-- 1. List every customer and their saved contact details.
SELECT
    customer_id,
    name,
    email,
    phone,
    full_address
FROM
    Customers
ORDER BY
    name;

-- 2. List restaurants and their saved locations.
SELECT
    restaurant_id,
    name,
    city,
    state,
    full_address,
    phone
FROM
    Restaurants
ORDER BY
    name;

-- 3. Show every menu item with the restaurant that serves it.
SELECT
    m.menu_item_id,
    m.name AS item_name,
    r.name AS restaurant_name,
    m.price,
    m.category,
    m.is_available
FROM
    MenuItems AS m
    JOIN Restaurants AS r ON r.restaurant_id = m.restaurant_id;

-- 4. Show the customer's order history.
SELECT
    o.order_id,
    c.name AS customer_name,
    o.order_date,
    o.total_amount,
    o.status
FROM
    Orders AS o
    JOIN Customers AS c ON c.customer_id = o.customer_id
ORDER BY
    o.order_date DESC;

-- 5. Show one order's item quantities and calculated line subtotals.
SELECT
    oi.order_id,
    m.name AS item_name,
    oi.quantity,
    oi.price AS unit_price,
    oi.quantity * oi.price AS subtotal
FROM
    Order_items AS oi
    JOIN MenuItems AS m ON m.menu_item_id = oi.menu_item_id
WHERE
    oi.order_id = 1;

-- JOIN 1. Combine order, customer, ordered menu item and restaurant information.
SELECT
    o.order_id,
    c.name AS customer_name,
    r.name AS restaurant_name,
    m.name AS item_name,
    oi.quantity,
    oi.price,
    oi.quantity * oi.price AS subtotal
FROM
    Orders AS o
    JOIN Customers AS c ON c.customer_id = o.customer_id
    JOIN Order_items AS oi ON oi.order_id = o.order_id
    JOIN MenuItems AS m ON m.menu_item_id = oi.menu_item_id
    JOIN Restaurants AS r ON r.restaurant_id = m.restaurant_id
ORDER BY
    o.order_id;

-- JOIN 2. List each restaurant with its menu, including restaurants with no items.
SELECT
    r.name AS restaurant_name,
    m.name AS item_name,
    m.price
FROM
    Restaurants AS r
    LEFT JOIN MenuItems AS m ON m.restaurant_id = r.restaurant_id
ORDER BY
    r.name,
    m.name;

-- JOIN 3. Show order items alongside their customer and menu item records.
SELECT
    o.order_id,
    c.name AS customer_name,
    m.name AS item_name,
    oi.quantity
FROM
    Orders AS o
    JOIN Customers AS c ON c.customer_id = o.customer_id
    JOIN Order_items AS oi ON oi.order_id = o.order_id
    JOIN MenuItems AS m ON m.menu_item_id = oi.menu_item_id;

-- Count customers and restaurants and total menu entries.
SELECT
    (
        SELECT
            COUNT(*)
        FROM
            Customers
    ) AS customer_count,
    (
        SELECT
            COUNT(*)
        FROM
            Restaurants
    ) AS restaurant_count,
    (
        SELECT
            COUNT(*)
        FROM
            MenuItems
    ) AS menu_item_count;

-- Revenue by status. Cancelled orders are shown separately for easy comparison.
SELECT
    status,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_amount
FROM
    Orders
GROUP BY
    status
ORDER BY
    status;

-- Total order value by restaurant, derived through ordered menu items.
SELECT
    r.name AS restaurant_name,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(oi.quantity * oi.price) AS item_revenue
FROM
    Orders AS o
    JOIN Order_items AS oi ON oi.order_id = o.order_id
    JOIN MenuItems AS m ON m.menu_item_id = oi.menu_item_id
    JOIN Restaurants AS r ON r.restaurant_id = m.restaurant_id
GROUP BY
    r.restaurant_id,
    r.name
ORDER BY
    item_revenue DESC;
