const quizService = {
    getQuestions: async () => {
      try {
        const response = await fetch("https://localhost:7175/api/Quiz/questions");
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const data = await response.json();
        console.log("Fetched Quiz Data:", data);
  
        // Kiểm tra nếu API trả về object có "$values"
        if (data.$values && Array.isArray(data.$values)) {
          return data.$values.map(q => ({
            id: q.id,
            questionText: q.questionText,
            answers: q.answers?.$values || [] // Lấy danh sách câu trả lời nếu có
          }));
        }
  
        throw new Error("API response is not an array");
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        return [];
      }
    }
  };
  
  export default quizService;
  