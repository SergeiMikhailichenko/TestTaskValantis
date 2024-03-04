let currentPage = 1;
let rows = 50;
let arrElements;

async function loadProducts(params) {
    const url = `https://api.valantis.store:41000/`;
    const newDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const pass = md5(`Valantis_${newDate}`);
    try{
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-Auth': pass,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        const responseData = await response.json();
        return responseData.result;
    }catch(e){
        console.log(e);
        return loadProducts(params);
    }

}

async function displayBrandsList() {
    const paramsBrands = {
        "action": "get_fields",
        "params": {"field": "brand"}
    };
    const arrBrands = await loadProducts(paramsBrands);
    const pageBrands = arrBrands.filter(el => el !== null);
    const uniqueBrands = [...new Set(pageBrands)].sort();
    
    const brandsEl = document.querySelector('.brands');
    uniqueBrands.forEach(element => {
        const brandEl = document.createElement('div');
        brandEl.classList.add('brand');
        brandEl.innerText = `${element}`;
        brandEl.addEventListener('click', async () => {
            currentPage = 1;
            const params = {
                "action": "filter",
                "params": {"brand": `${element}` }
            };
            const listElements = await loadProducts(params);
            await displayList(listElements, rows, currentPage);
            displayPagination(listElements, rows);
        })
        brandsEl.appendChild(brandEl);
    });
}

async function displayList(arrData, rowPage, page) {
    const start = rowPage * (page - 1);
    const end = start + rowPage;
    const paginatedData = arrData.slice(start, end);

    const paramsPageItems = {
        "action": "get_items",
        "params": {"ids": paginatedData}
    };

    const pageData = await loadProducts(paramsPageItems);
    const postsEl = document.querySelector('.posts');
    postsEl.innerHTML = '';

    if (pageData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.classList.add('no-data-message');
        noDataMessage.innerText = "По указанным параметрам не найдено товаров.";
        postsEl.appendChild(noDataMessage);
    } else {
        pageData.forEach(element => {
            const postEl = document.createElement('div');
        postEl.classList.add('post');
    
        const postIdEl = document.createElement('div');
        postIdEl.classList.add('post__id');
        postIdEl.innerText = element.id;
    
        const productNameEl = document.createElement('div');
        productNameEl.classList.add('post__product');
        productNameEl.innerText = element.product;
    
        const priceEl = document.createElement('div');
        priceEl.classList.add('post__price');
        priceEl.innerText = element.price;
    
        const brandEl = document.createElement('div');
        brandEl.classList.add('post__brand');
        brandEl.innerText = element.brand;
    
        postEl.appendChild(postIdEl);
        postEl.appendChild(productNameEl);
        postEl.appendChild(priceEl);
        postEl.appendChild(brandEl);
    
        postsEl.appendChild(postEl);
        });
    }
}

function displayPagination(arrData, rowPage) {
    const paginationEl = document.querySelector('.pagination');
    paginationEl.innerHTML = '';
    const pagesCount = Math.ceil(arrData.length / rowPage);
    const ulEl = document.createElement('ul');
    ulEl.classList.add('pagination__list');

    for (let i = 0; i < pagesCount; i++) {
        const liEl = displayPaginationBtn(i + 1);
        ulEl.appendChild(liEl);
    }

    paginationEl.appendChild(ulEl);
}

function displayPaginationBtn(page) {
    const liEl = document.createElement('li');
    liEl.classList.add('pagination__item');
    liEl.innerText = page;
    if (currentPage === page) {
        liEl.classList.add('pagination__item--active');
    }

    liEl.addEventListener('click', () => {
        currentPage = page;
        displayList(arrElements, rows, currentPage);

        let currentItemLi = document.querySelector('li.pagination__item--active');
        currentItemLi.classList.remove('pagination__item--active')

        liEl.classList.add('pagination__item--active');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    return liEl;
}


async function applySearch() {
    currentPage = 1;
    const searchText = document.getElementById('search').value;
    let params;
    if (!isNaN(Number(searchText))) {
        params = {
            "action": "filter",
            "params": {"price": Number(searchText)}
        };
        
    } else {
        params = {
            "action": "filter",
            "params": {"product": searchText}
        };

    }

    const elementsIds = await loadProducts(params);
    arrElements = [...new Set(elementsIds)];
    await displayList(arrElements, rows, currentPage);
    displayPagination(arrElements, rows);
    
}


displayBrandsList();
document.getElementById('searchButton').addEventListener('click', applySearch);
