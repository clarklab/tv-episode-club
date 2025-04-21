var movies = [
  "The Treasure of Foggy Mountain",
  "North",
  "Romancing the Stone"
];

var currentMovieIndex = 0;
const startDate = new Date('2025-04-20');

function getWatchDate(movieIndex) {
  const watchDate = new Date(startDate);
  watchDate.setDate(startDate.getDate() + (movieIndex * 7));
  return watchDate;
}

function fetchMovieData(movieTitle) {
  const apiKey = '1a13838f';
  return fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "False") {
        console.error('Error fetching movie:', data.Error);
        return null;
      }
      return data;
    })
    .catch(error => {
      console.error('Error fetching movie:', error);
      return null;
    });
}

function displayMovie(movieData, index) {
  if (!movieData) return;
  
  const watchDate = getWatchDate(index);
  const formattedDate = watchDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'numeric', 
    day: 'numeric'
  });

  const item = `
    <li class='bg-white shadow-2xl mb-6 pb-6 flex flex-col' id='${movieData.imdbID}'>
      <img loading='lazy' src='${movieData.Poster}' class='w-full'>
      <div class='flex flex-col gap-2 my-6 mb-4 px-6'>
        <h1 class='text-3xl font-bold leading-none'>${movieData.Title}</h1>
        <p class='pill inline-block rounded bg-[#4deeea] px-2 py-1 mt-1 expanded text-black whitespace-nowrap self-start'>
          ${movieData.Year}
        </p>
      </div>
      <div class='px-6 text-gray-500 flex flex-col flex-grow *:flex-grow'>
        <p class="line-clamp-3">${movieData.Plot}</p>
        <div class='flex !flex-grow-0 justify-between gap-6 border-t pt-4 mt-4'>
          <p class='text-gray-500' title='Watch Date'>
            <svg class='inline w-5 h-5 relative -top-0.5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
              <path stroke-linecap='round' stroke-linejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' />
            </svg>
            &nbsp;<strong>Watch on:</strong> ${formattedDate}
          </p>
          <p class='text-gray-500' title='IMDb Rating'>
            <svg class='inline w-5 h-5 relative -top-0.5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
              <path stroke-linecap='round' stroke-linejoin='round' d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' />
            </svg>
            &nbsp;${movieData.imdbRating}
          </p>
        </div>
      </div>
    </li>
  `;
  
  $("ul").append(item);
}

function scroller() {
  setTimeout(function() { 
        $([document.documentElement, document.body]).animate({
      scrollTop: $(".current").offset().top - 100
    }, 200); 
    }, 1000);
}

function getCurrentMovieIndex() {
  const now = new Date(); // Use real current date
  const diffTime = now - startDate;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  console.log('Debug:', {
    now,
    startDate,
    diffTime,
    diffWeeks,
    moviesLength: movies.length
  });
  return Math.min(Math.max(0, diffWeeks), movies.length - 1);
}

// Fetch and display all movies in order
Promise.all(movies.map(movieTitle => fetchMovieData(movieTitle)))
  .then(movieDataArray => {
    const currentIndex = getCurrentMovieIndex();
    console.log('Current index:', currentIndex);
    movieDataArray.forEach((movieData, index) => {
      if (movieData) {
        displayMovie(movieData, index);
        if (index === currentIndex) {
          console.log('Marking as current:', movieData.Title);
          $(`#${movieData.imdbID}`).addClass("!border-[#4deeea] border-4 current");
scroller();
        }
      }
    });
  });
