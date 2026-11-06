USE OnlineFoodOrdering;

SELECT
    Orders.order_id,
    Customers.name As customer_name,
    Restaurants.name AS restaurant_name,
    Orders.total_amount,
    Orders.status
FROM
    Orders
    INNER JOIN Customers ON Orders.customer_id = Customers.customer_id
    INNER JOIN Restaurants ON Orders.restaurant_id = Restaurants.restaurant_id;

SELECT
    Order_items.order_item_id,
    Order_items.order_id,
    MenuItems.name AS item_name,
    Order_items.quantity,
    Order_items.price,
    Orders.total_amount
FROM
    Order_items
    INNER JOIN MenuItems ON Order_items.menu_item_id = MenuItems.menu_item_id
    INNER JOIN Orders ON Order_items.order_id = Orders.order_id;
