<script>
  import { getCSRFToken } from './utilities'
  let count = $state(0)
  const increment = async () => {
    
    try {
      const response = await fetch('/counter/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ count: count })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      count = data.count;
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  }
</script>

<button onclick={increment}>
  count is {count}
</button>
