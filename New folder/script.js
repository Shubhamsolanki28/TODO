const API_URL = 'https://dummyjson.com/todos';
const todoList = document.getElementById('todoList');
const loader = document.getElementById('loader');
const pagination = document.getElementById('pagination');

const searchInput = document.getElementById('searchInput');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');
const addTodoForm = document.getElementById('addTodoForm');
const todoTitle = document.getElementById('todoTitle');
const todoDate = document.getElementById('todoDate');

let todos = [];
let currentPage = 1;
const todosPerPage = 10;

// Loader
function showLoader() {
  loader.classList.remove('d-none');
}
function hideLoader() {
  loader.classList.add('d-none');
}

// Generate random date (for createdAt)
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fetch Todos
async function fetchTodos() {
  showLoader();
  try {
    const res = await fetch(`${API_URL}?limit=100`);
    const data = await res.json();
    todos = data.todos.map(todo => ({
      ...todo,
      createdAt: randomDate(new Date(2024, 0, 1), new Date())
    }));
    renderTodos();
    renderPagination();
  } catch (err) {
    alert('❌ Error fetching todos');
  }
  hideLoader();
}

// Render Todos
function renderTodos(filtered = null) {
  const list = filtered || todos;
  const start = (currentPage - 1) * todosPerPage;
  const end = start + todosPerPage;
  const visibleTodos = list.slice(start, end);

  todoList.innerHTML = '';

  if (visibleTodos.length === 0) {
    todoList.innerHTML = `<li class="list-group-item">No tasks found</li>`;
    return;
  }

  visibleTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${todo.todo}</strong><br/>
        <small class="created-date">Created: ${new Date(todo.createdAt).toLocaleDateString()}</small>
      </div>
      <span class="badge bg-${todo.completed ? 'success' : 'secondary'}">${todo.completed ? 'Done' : 'Pending'}</span>
    `;
    todoList.appendChild(li);
  });
}

// Render Pagination
function renderPagination(filteredList = null) {
  const list = filteredList || todos;
  const pageCount = Math.ceil(list.length / todosPerPage);
  pagination.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.addEventListener('click', () => {
      currentPage = i;
      renderTodos(list);
      renderPagination(list);
    });
    pagination.appendChild(li);
  }
}

// Search Todos
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = todos.filter(todo => todo.todo.toLowerCase().includes(keyword));
  currentPage = 1;
  renderTodos(filtered);
  renderPagination(filtered);
});

// Filter by Date
filterBtn.addEventListener('click', () => {
  const from = new Date(fromDate.value);
  const to = new Date(toDate.value);
  const filtered = todos.filter(todo => {
    const created = new Date(todo.createdAt);
    return (!fromDate.value || created >= from) &&
           (!toDate.value || created <= to);
  });
  currentPage = 1;
  renderTodos(filtered);
  renderPagination(filtered);
});

// Add New Todo
addTodoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = todoTitle.value.trim();
  const date = todoDate.value;

  if (!title || !date) {
    alert("Please enter task and date");
    return;
  }

  showLoader();
  try {
    const res = await fetch(API_URL + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: title,
        completed: false,
        userId: 1
      })
    });

    const newTodo = await res.json();
    newTodo.createdAt = new Date(date);
    todos.unshift(newTodo); // Add to top
    todoTitle.value = '';
    todoDate.value = '';
    currentPage = 1;
    renderTodos();
    renderPagination();
  } catch (err) {
    alert('❌ Failed to add todo');
  }
  hideLoader();
});

// Initial Load
fetchTodos();
