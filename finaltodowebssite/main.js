const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

const categoriesContainer = document.querySelector('[data-categories]');

const currentlyViewing = document.querySelector('[data-currently-viewing]');

const newTodoForm = document.querySelector('[data-new-todo-form]');
const newTodoSelect = document.querySelector('[data-new-todo-select]');
const newTodoInput = document.querySelector('[data-new-todo-input]');

const editTodoForm = document.querySelector('[data-edit-todo-form]');
const editTodoSelect = document.querySelector('[data-edit-todo-select]');
const editTodoInput = document.querySelector('[data-edit-todo-input]');


const todosContainer = document.querySelector('[data-cards]');


const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_TODOS_KEY = 'LOCAL_STORAGE_TODOS_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TODOS_KEY)) || [];


newCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = newCategoryInput.value;
    const isCategoryEmpty = !category || !category.trim().length;

    if (isCategoryEmpty) {
        return console.log('please enter a task');
    }

    categories.push({ _id: Date.now().toString(), category: category, color: getRandomHexColor() });

    newCategoryInput.value = '';

    saveAndRender();
});


categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
        if (!e.target.dataset.categoryId) {
            selectedCategoryId = null;
        } else {
            selectedCategoryId = e.target.dataset.categoryId;
        }

        saveAndRender();
    }
});


categoriesContainer.addEventListener('change', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const newCategoryColor = e.target.value;
        const categoryId = e.target.parentElement.dataset.categoryId;
        const categoryToEdit = categories.find((category) => category._id === categoryId);

        categoryToEdit.color = newCategoryColor;

        saveAndRender();
    }
});


currentlyViewing.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'span') {
        categories = categories.filter((category) => category._id !== selectedCategoryId);

        todos = todos.filter((todo) => todo.categoryId !== selectedCategoryId);

        selectedCategoryId = null;

        saveAndRender();
    }
});


newTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    todos.push({
        _id: Date.now().toString(),
        categoryId: newTodoSelect.value,
        todo: newTodoInput.value,
    });

    newTodoSelect.value = '';
    newTodoInput.value = '';

    saveAndRender();
});

let todoToEdit = null;
todosContainer.addEventListener('click', (e) => {
    if (e.target.classList[1] === 'fa-edit') {
        newTodoForm.style.display = 'none';
        editTodoForm.style.display = 'flex';

        todoToEdit = todos.find((todo) => todo._id === e.target.dataset.editTodo);

        editTodoSelect.value = todoToEdit.categoryId;
        editTodoInput.value = todoToEdit.todo;
    }
    if (e.target.classList[1] === 'fa-trash-alt') {
        const todoToDeleteIndex = todos.findIndex((todo) => todo._id === e.target.dataset.deleteTodo);

        todos.splice(todoToDeleteIndex, 1);

        saveAndRender();
    }
});

editTodoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    todoToEdit.categoryId = editTodoSelect.value;
    todoToEdit.todo = editTodoInput.value;

    editTodoForm.style.display = 'none';
    newTodoForm.style.display = 'flex';

    editTodoSelect.value = '';
    editTodoInput.value = '';

    saveAndRender();
});


function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
}

function render() {
    clearChildElements(categoriesContainer);
    clearChildElements(newTodoSelect);
    clearChildElements(editTodoSelect);
    clearChildElements(todosContainer);

    renderCategories();
    renderFormOptions();
    renderTodos();

    if (!selectedCategoryId || selectedCategoryId === 'null') {
        currentlyViewing.innerHTML = `You are currently viewing <strong>All Categories</strong>`;
    } else {
        const currentCategory = categories.find((category) => category._id === selectedCategoryId);
        currentlyViewing.innerHTML = `You are currently viewing <strong>${currentCategory.category}</strong> <span>(delete)</span>`;
    }
}

function renderCategories() {
    categoriesContainer.innerHTML += `<li class="sidebar-item ${selectedCategoryId === 'null' || selectedCategoryId === null ? 'active' : ''}" data-category-id="">View All</li>
	`;

    categories.forEach(({ _id, category, color }) => {
        categoriesContainer.innerHTML += ` <li class="sidebar-item ${_id === selectedCategoryId ? 'active' : ''}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
    });
}

function renderFormOptions() {

    newTodoSelect.innerHTML += `<option value="">Select A Category</option>`;
    editTodoSelect.innerHTML += `<option value="">Select A Category</option>`;

    categories.forEach(({ _id, category }) => {
        newTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
        editTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
    });
}

function renderTodos() {
    let todosToRender = todos;


    if (selectedCategoryId && selectedCategoryId !== 'null') {
        todosToRender = todos.filter((todo) => todo.categoryId === selectedCategoryId);
    }


    todosToRender.forEach(({ _id, categoryId, todo }) => {


        const { color, category } = categories.find(({ _id }) => _id === categoryId);
        const backgroundColor = convertHexToRGBA(color, 20);
        todosContainer.innerHTML += `
			<div class="todo" style="border-color: ${color}">
					<div class="todo-tag" style="background-color: ${backgroundColor}; color: ${color};">
						${category}
					</div>
					<p class="todo-description">${todo}</p>
					<div class="todo-actions">
						<i class="far fa-edit" data-edit-todo=${_id}></i>
						<i class="far fa-trash-alt" data-delete-todo=${_id}></i>
					</div>
			</div>`;
    });
}


function clearChildElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convertHexToRGBA(hexCode, opacity) {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
}

function getRandomHexColor() {
    var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return `#${hex}`;
}

window.addEventListener('load', render);
