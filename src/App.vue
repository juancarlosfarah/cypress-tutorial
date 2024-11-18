<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center text-black">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center" data-cy="todo-title">To-Do List</h1>

      <!-- Input for new task -->
      <div class="mb-4">
        <input
            v-model="newTask"
            @keyup.enter="addTask"
            placeholder="Add new task"
            class="w-full px-3 py-2 border border-gray-300 rounded"
            data-cy="new-task-input"
        />
      </div>

      <!-- Task list -->
      <ul class="space-y-3">
        <li
            v-for="(task, index) in tasks"
            :key="index"
            class="flex flex-col justify-between items-start bg-gray-50 px-4 py-2 rounded shadow-sm"
            :data-cy="'task-item-' + index"
        >
          <!-- Task title and status -->
          <div class="w-full flex justify-between items-center">
            <span class="text-lg font-semibold" :data-cy="'task-text-' + index">{{ task.text }}</span>

            <!-- Delete button -->
            <button
                @click="removeTask(index)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                :data-cy="'delete-task-' + index"
            >
              Delete
            </button>
          </div>

          <!-- Dropdown to change task status -->
          <div class="flex justify-between w-full mt-2">
               <span class="text-sm" :data-cy="'task-status-' + index">Status:
               <span :class="{
                 'text-red-500': task.status === 'pending',
                 'text-yellow-500': task.status === 'doing',
                 'text-green-500': task.status === 'done'
               }">{{ task.status }}</span>
               </span>
            <select
                v-model="task.status"
                @change="saveTasks"
                class="border rounded p-1 text-sm"
                :data-cy="'status-select-' + index"
            >
              <option value="pending">Pending</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      newTask: '',
      tasks: JSON.parse(localStorage.getItem('tasks')) || []
    };
  },
  created() {
    fetch('/api/todos')
        .then(response => response.json())
        .then(data => {
          this.tasks = data;
        });
  },
  methods: {
    updateTaskStatus(taskId, status) {
      apiService.patchTask(taskId, { status });
    },
    updateTask(task) {
      apiService.putTask(task);
    },
    addTask() {
      if (this.newTask.trim()) {
        // Add the new task with default status of 'pending'
        this.tasks.push({
          text: this.newTask,
          status: 'pending'
        });
        this.postTask(this.newTask);
        this.newTask = ''; // Clear input field
        this.saveTasks(); // Save to localStorage
      }
    },
    postTask(task) {
      console.log(`Task added: ${task}`);
      // sends task to api...
    },
    removeTask(index) {
      // Remove task by index
      this.tasks.splice(index, 1);
      this.saveTasks(); // Save to localStorage
    },
    saveTasks() {
      // Save the task list to localStorage
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      window.__app__ = this;
    }
  }
};
</script>

<style scoped>
/* Additional styles (if any) can go here */
</style>
