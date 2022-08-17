// var berisi array yang akan menampung beberapa object (data todo user)
const todos = [];

// mendefinisikan nama key storage pada localStorage
const STORAGE_KEY = "TODO_APPS";

// mendefinisikan custom event
const RENDER_EVENT = "render-todo";
const SAVED_EVENT = "saved-todo";

/**
 * Ketika halaman diload maka elemen HTML sudah dimuat menjadi DOM dengan baik
 * var submitForm memanggil elemen form untuk menangani event 'submit'
 *
 * elemen form secara default akan memuat ulang secara otomatis website ketika disubmit,
 * method 'preventDefault()' untuk menyimpan data dalam memory agar terjaga dengan baik.
 *
 * terakhir memanggil fungsi 'addTodo()' untuk menambah list todo
 */
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

/**
 * function ini untuk membuat todo
 * var 'textTodo' untuk mendapatkan nilai atau value title yang diinputkan oleh user.
 * var 'timestamp untuk mendapatkan nilai atau value timestamp yang diinputkan oleh user.
 *
 * var 'generateID' menghasilkan dari function generateId(),
 * var 'todoObject' membuat object dengan parameter dari function generateTodoObject(),
 * lalu disimpan ke dalam array bernama 'todos' dengan method push() untuk memasukan data ke dalam array.
 *
 * terakhir, panggil custom event 'RENDER_EVENT' menggunakan method dispatchEvent(),
 * diterapkan untuk me-render data yang telah disimpan pada array todos.
 */
function addTodo() {
  const textTodo = document.getElementById("title").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// function untuk menghasilkan identitas unik pada setiap item todo
function generateId() {
  return +new Date();
}

/**
 * function ini untuk membuat object baru dari data yang sudah disediakan dari,
 * inputan (paramater function) diantaranya:
 *
 * @param {String} id untuk id yang unik
 * @param {String} task untuk nama todo
 * @param {String} timestamp untuk waktu todo
 * @param {Boolean} isCompleted sebagai penanda todo apakah sudah selesai atau belum
 * @returns
 */
function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  };
}

/**
 * membuat listener dari 'RENDER_EVENT'
 * untuk memastikan container dari todo bersih sebelum diperbarui, maka var 'uncompletedTODOList' dan 'completedTODOList',
 * menggunakan property (innerHTML = ""), supaya tidak terjadi duplikasi data ketika,
 * menambahkan elemen DOM baru dengan method append().
 *
 * lakukan loop pada var 'todos' dengan nama alias 'todoItem', gunanya untuk menampilkan data ke halaman web,
 * untuk menghasilkan todo gunakan function makeTodo(paramater: todoItem), lalu lakukan pengkondisian,
 * jika property isCompleted dari todoItem itu false maka akan di-append ke dalam section 'tugas yang harus dilakukan',
 * jika property isCompleted dari todoItem itu true maka akan di-append ke dalam section 'tugas yang sudah dilakukan'.
 */
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) uncompletedTODOList.append(todoElement);
    else completedTODOList.append(todoElement);
  }
});

/**
 * function ini digunakan untuk membuat todo
 * var 'textTitle' membuat elemen HTML baru yaitu 'h2' dan,
 * berisi konten yang diambil dari paramater 'todoObject' lalu memanggil property 'task'.
 *
 * var 'textTimestamp' membuat elemen HTML baru yaitu 'p' dan,
 * berisi konten yang diambil dari paramter 'todoObject' lalu memanggil property 'timestamp'.
 *
 * var 'textContainer' membuat elemen HTML baru yaitu 'div' dan menambahkan class 'inner',
 * lalu meng-append var 'textTitle' dan 'textTimestamp' menggunakan method append().
 *
 * var 'container' membuat elemen HTML baru yaitu 'div' dan menambahkan class 'item shadow',
 * menambahkan attribute id dengan value todo ke {todoObject.id} menggunakan method setAttribute(),
 * lalu meng-append var 'textContainer' menggunakan method append().
 *
 * sebelum di return 'container' nya, lakukan pengkondisian terlebih dahulu,
 * jika property isCompleted dari parameter todoObject adalah true, maka
 * akan dibuatkan 2 tag button untuk undo todo dan delete todo, lalu menerapkan event
 * listener click, untuk undo memanggil function 'undoTaskFromCompleted' dengan mengisi,
 * parameter id dari todoObject dan untuk delete memanggil function 'removeTaskFromCompleted',
 * dengan mengisi parameter id dari todoObject.
 *
 * sedangkan jika property isCompleted dari parameter todoObject adalah false, maka membuat
 * elemen button untuk ceklis, jika button ceklis di click, maka akan memanggil function 'addTaskToCompleted',
 * dengan mengisi mengisi parameter id dari todoObject. Dan nanti todo nya akan pindah ke section 'tugas yang sudah dilakukan'.
 *
 * terakhir lakukan return pada variabel container
 *
 * @param {Object} todoObject parameter untuk memanggil / menggunakan array todo
 * @returns
 */
function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

/**
 * function ini digunakan untuk memindahkan todo dari section 'tugas yang harus dilakukan' ke,
 * 'tugas yang sudah dilakukan'. Prinsip nya merubah state/property 'isCompleted' dari false ke true,
 * lalu memanggil event RENDER_EVENT untuk memperbarui data yang ditampilkan.
 *
 * terakhir, memanggil function bernama 'findTodo' dengan nerima parameter untuk mencari todo,
 * dengan ID yang sesuai pada array 'todos'
 *
 * @param {String} todoId paramater untuk mencari todo dengan ID yang sesuai array 'todos'
 * @returns
 */
function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

/**
 * melakukan pencarian ID pada todo dengan melakukan looping for of,
 * kemudian melakukan pengkondisian jika nama alias => 'todoItem' sama dengan identik 'todoId',
 * maka return data nya sesuai ID, jika tidak sama maka kembalikan null.
 *
 * @param {String} todoId paramater untuk mencari todo dengan ID yang sesuai array 'todos'
 * @returns
 */
function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

/**
 * function ini untuk menghapus todo jika sudah selesai dilakukan
 * delete atau hapus todo berdasarkan index yang didapatkan dari pencarian todo dengan,
 * menggunakan function 'findTodoIndex(). Apabila pencarian berhasil, maka akan menghapus todo,
 * tersebut dengan menggunakan function 'splice()' yang disediakan oleh Javascript.
 *
 * @param {String} todoId paramater untuk mencari todo dengan ID yang sesuai array 'todos'
 * @returns
 */
function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

/**
 * function ini mirip dengan function addTaskToCompleted() hanya saja perbedaan nya,
 * di state/property 'isCompleted' nya bernilai false untuk meng-undo todo task yang sebelumnya completed(selesai),
 * bisa dipindah menjadi incomplete(belum selesai). Memanggil function 'findTodo' untuk mencari ID,
 * lalu memanggil event RENDER_EVENT untuk memperbarui data yang ditampilkan.
 *
 * @param {String} todoId paramater untuk mencari todo dengan ID yang sesuai array 'todos'
 * @returns
 */
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

/**
 * function ini untuk mencari todo berdasarkan index array
 * melakukan loop for in dan mengecek jika 'todo[index].id' sama dengan indentik todoId
 * maka akan mereturn index tersebut. Jika tidak akan mereturn -1
 *
 * @param {String} todoId paramater untuk mencari todo dengan ID yang sesuai array 'todos'
 * @returns
 */
function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

/**
 * function untuk melakukan save data ke localStorage
 * jika browser mendukung web storage maka todos kan diubah dari JSON menjadi string dan disimpan ke var 'parsed',
 * dan localStorage menyimpan todos dengan method 'setItem' dengan key dari var 'STORAGE_KEY' lalu diikuti value nya yaitu dari var 'parsed'
 */
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// function untuk mengecek apakah browser yang digunakan mendukung 'Web Storage' atau tidak
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

/**
 * function load data dari storage dengan method 'getItem()' lalu di parsing dalam bentuk JSON,
 * dan dilakukan pengkondisian, jika data nya tidak null atau ada, maka lakukan loop dengan for of kemudian,
 * di push ke dalam array todos.
 */
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
