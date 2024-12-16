async function calculatePlaylistDetails() {
    const apiKey = "AIzaSyCyQx8LcxkuwImzIGQYm4YF3tj0G7Gg5-0"; // Replace with your API key
    const playlistLink = document.getElementById("playlistLink").value;
    const playlistId = getPlaylistId(playlistLink);
  
    if (!playlistId) {
      alert("Invalid YouTube playlist link.");
      return;
    }
  
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
    const playlistInfoUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`;
  
    try {
      // Fetch playlist details
      const playlistInfoResponse = await fetch(playlistInfoUrl);
      const playlistInfo = await playlistInfoResponse.json();
  
      if (!playlistInfo.items || playlistInfo.items.length === 0) {
        alert("Playlist not found.");
        return;
      }
  
      const playlistName = playlistInfo.items[0].snippet.title;
      const videoCount = playlistInfo.items[0].contentDetails.itemCount;
  
      // Fetch video details
      let totalDuration = 0;
      let nextPageToken = "";
      do {
        const response = await fetch(apiUrl + `&pageToken=${nextPageToken}`);
        const data = await response.json();
        nextPageToken = data.nextPageToken;
  
        for (const item of data.items) {
          const videoDuration = await getVideoDuration(item.contentDetails.videoId, apiKey);
          totalDuration += videoDuration;
        }
      } while (nextPageToken);
  
      // Display results
      document.getElementById("playlistName").textContent = `Playlist Name: ${playlistName}`;
      document.getElementById("videoCount").textContent = `Number of Videos: ${videoCount}`;
      document.getElementById("playlistDuration").textContent = `Total Duration: ${formatDuration(totalDuration)}`;
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      alert("An error occurred while fetching playlist details. Check the console for more information.");
    }
  }
  
  function getPlaylistId(link) {
    const url = new URL(link);
    return url.searchParams.get("list");
  }
  
  async function getVideoDuration(videoId, apiKey) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const duration = data.items[0].contentDetails.duration;
  
    // Convert ISO 8601 duration to seconds
    return iso8601ToSeconds(duration);
  }
  
  function iso8601ToSeconds(iso8601) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = iso8601.match(regex);
    const hours = parseInt(matches[1] || 0);
    const minutes = parseInt(matches[2] || 0);
    const seconds = parseInt(matches[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours, ${minutes} minutes`;
  }
  