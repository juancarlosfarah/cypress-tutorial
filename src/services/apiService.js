const apiService = {
    patchTask(taskId, updates) {
        console.log(`Patching task with ID ${taskId}:`, updates);
    },

    putTask(task) {
        console.log(`Putting task:`, task);
    },
};

export default apiService;