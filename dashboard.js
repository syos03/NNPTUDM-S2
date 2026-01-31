let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;

async function GetAllProducts() {
    try {
        let res = await fetch('https://api.escuelajs.co/api/v1/products');
        if (res.ok) {
            allProducts = await res.json();
            filteredProducts = allProducts;
            DisplayProducts();
        }
    } catch (error) {
        console.log(error);
    }
}

function DisplayProducts() {
    let bodyTable = document.getElementById('products-table');
    bodyTable.innerHTML = '';

    let start = (currentPage - 1) * pageSize;
    let end = start + pageSize;
    let paginatedProducts = filteredProducts.slice(start, end);

    for (const product of paginatedProducts) {
        bodyTable.innerHTML += `<tr>
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>${product.category.name}</td>
            <td><img src="${product.images[0]}" alt="${product.title}"></td>
        </tr>`;
    }

    DisplayPagination();
}

function DisplayPagination() {
    let totalPages = Math.ceil(filteredProducts.length / pageSize);
    let paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        let btnStyle = i === currentPage ? 'font-weight: bold;' : '';
        paginationDiv.innerHTML += `<button style="${btnStyle}" onclick="GoToPage(${i})">${i}</button>`;
    }
}

function GoToPage(page) {
    currentPage = page;
    DisplayProducts();
}

function ChangePageSize() {
    pageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1;
    DisplayProducts();
}

function SearchProducts() {
    let searchText = document.getElementById('search').value.toLowerCase();
    filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchText)
    );
    currentPage = 1;
    DisplayProducts();
}

function SortByPrice(order) {
    if (order === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
    currentPage = 1;
    DisplayProducts();
}

function SortByTitle(order) {
    if (order === 'asc') {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
    }
    currentPage = 1;
    DisplayProducts();
}

GetAllProducts();
