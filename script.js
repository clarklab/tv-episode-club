var movies = [
  "The Treasure of Foggy Mountain",
  "North",
  "The Gutter",
  "Romancing the Stone",
  "The Air Up There"
];

var currentMovieIndex = 0;
const startDate = new Date('2025-04-23');

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
        <h1 class='text-4xl font-bold leading-none'>${movieData.Title}</h1>
        <p class='pill inline-block rounded bg-[#4deeea] px-2 py-1 mt-1 expanded text-black whitespace-nowrap self-start'>
          ${movieData.Year}
        </p>
      </div>
      <div class='px-6 text-gray-500 flex flex-col flex-grow *:flex-grow'>
        <p class="line-clamp-3 text-[#746BD9]">${movieData.Plot}</p>
        <p class="text-sm mt-2 text-gray-400">${movieData.Actors.split(', ').slice(0, 5).join(', ')}</p>
        <div class='flex !flex-grow-0 justify-between gap-6 border-t pt-4 mt-4'>
          <p class='text-gray-500' title='Watch Date'>
          <svg class='inline w-5 h-5 relative -top-0.5 fill-[#746BD9]'  width="100pt" height="100pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="m33.332 16.668c-2.293 0-4.168 1.875-4.168 4.168v6.25h8.332v-6.25c0.003906-2.293-1.8711-4.168-4.1641-4.168z"/>
            <path d="m70.832 27.082v4.168c0 2.293-1.875 4.168-4.168 4.168-2.293 0-4.168-1.875-4.168-4.168v-4.168h-24.996v4.168c0 2.293-1.875 4.168-4.168 4.168s-4.168-1.875-4.168-4.168v-4.168h-12.496v56.25h66.668l-0.003907-56.25zm4.168 47.918h-50v-35.418h50z"/>
            <path d="m66.668 16.668c-2.293 0-4.168 1.875-4.168 4.168v6.25h8.332v-6.25c0-2.293-1.875-4.168-4.1641-4.168z"/>
            <path d="m45.832 70.418-11.25-11.25 5.8359-5.8359 5.4141 5.418 13.75-13.75 5.8359 5.832z"/>
          </g>
          </svg>
            &nbsp;<strong>Watch:</strong> ${formattedDate}
          </p>
          <p class='text-gray-500' title='IMDb Rating'>
            <svg class='inline w-5 h-5 relative -top-0.5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#746BD9'>
              <path fill-rule='evenodd' d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z' clip-rule='evenodd' />
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
