
function Product(id, name, price, quantity, category, isAvailable) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.category = category;
    this.isAvailable = isAvailable;
}


const products = [
    new Product(1, "iPhone 15 Pro", 25000000, 15, "Electronics", true),
    new Product(2, "Samsung Galaxy S24", 22000000, 8, "Electronics", true),
    new Product(3, "MacBook Air M2", 28000000, 0, "Electronics", false),
    new Product(4, "Áo thun nam", 150000, 50, "Accessories", true),
    new Product(5, "Giày sneaker", 800000, 25, "Accessories", true),
    new Product(6, "Tai nghe AirPods", 5000000, 3, "Accessories", true)
];


function getNameAndPrice() {
    return products.map(product => ({
        name: product.name,
        price: product.price
    }));
}

function getAvailableProducts() {
    return products.filter(product => product.quantity > 0);
}

function hasExpensiveProduct() {
    return products.some(product => product.price > 30000000);
}

function allAccessoriesAvailable() {
    return products
        .filter(product => product.category === "Accessories")
        .every(product => product.isAvailable === true);
}

function getTotalInventoryValue() {
    return products.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
}

function displayProductsForOf() {
    console.log("\nCâu 8: Duyệt mảng bằng for...of");
    for (const product of products) {
        const status = product.isAvailable ? "Có sẵn" : "Hết hàng";
        console.log(`${product.name} - ${product.category} - ${status}`);
    }
}

function displayProductPropertiesForIn() {
    console.log("\nCâu 9: Duyệt thuộc tính bằng for...in");
    products.forEach((product, index) => {
        console.log(`\nSản phẩm ${index + 1}:`);
        for (const key in product) {
            console.log(`  ${key}: ${product[key]}`);
        }
    });
}

function getAvailableAndInStockProducts() {
    return products
        .filter(product => product.isAvailable === true && product.quantity > 0)
        .map(product => product.name);
}


console.log("QUẢN LÝ SẢN PHẨM\n");

console.log("Danh sách tất cả sản phẩm:");
console.table(products);

console.log("\nCâu 3: Tên và giá sản phẩm");
console.table(getNameAndPrice());

console.log("\nCâu 4: Sản phẩm còn hàng (quantity > 0)");
console.table(getAvailableProducts());

console.log("\nCâu 5: Có sản phẩm giá trên 30 triệu?");
console.log(hasExpensiveProduct() ? "Có" : "Không");

console.log("\nCâu 6: Tất cả Accessories có đang bán?");
console.log(allAccessoriesAvailable() ? "Có" : "Không");

console.log("\nCâu 7: Tổng giá trị kho hàng");
const totalValue = getTotalInventoryValue();
console.log(`${totalValue.toLocaleString('vi-VN')} VNĐ`);

displayProductsForOf();

displayProductPropertiesForIn();

console.log("\nCâu 10: Sản phẩm đang bán và còn hàng");
const availableProducts = getAvailableAndInStockProducts();
console.log(availableProducts.join(", "));
