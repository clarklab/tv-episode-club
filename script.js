var movies = [];
var movieData = []; // Store both title and date
var currentMovieIndex = 0;
const startDate = new Date('2025-04-23');

// Function to fetch movies from public Google Sheet
async function fetchMoviesFromSheet() {
  try {
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTgDa2SPx0xs2P1y83hgDVFJgmboovpcFJ4ajtwKW4IfetKurC5--agQ2LXIL3QF5ZdLmw-_JN1QKvW/pubhtml');
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    // Find the table with movie data
    const table = doc.querySelector('table');
    if (!table) return [];
    
    const movies = [];
    // Skip header row and iterate through table rows
    const rows = Array.from(table.querySelectorAll('tr')).slice(2); // Skip first two rows (header and empty row)
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        const title = cells[0].textContent.trim();
        const dateStr = cells[1].textContent.trim();
        if (title && dateStr) {
          // Parse the date (MM/DD/YY format)
          const [month, day, year] = dateStr.split('/');
          const date = new Date(`20${year}`, month - 1, day);
          movies.push({ title, date });
        }
      }
    });
    
    return movies;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
}

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
        console.error('Error fetching movie:', data.Error, 'for title:', movieTitle);
        return null;
      }
      return data;
    })
    .catch(error => {
      console.error('Error fetching movie:', error, 'for title:', movieTitle);
      return null;
    });
}

function displayMovie(movieData, index) {
  if (!movieData) return;
  
  const watchDate = movieData.date;
  const formattedDate = watchDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'numeric', 
    day: 'numeric'
  });

  // Calculate if movie is more than a week old
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const isPastMovie = watchDate < oneWeekAgo;

  // Get Rotten Tomatoes rating from Ratings array and convert to number
  const rtRating = movieData.Ratings?.find(rating => rating.Source === 'Rotten Tomatoes')?.Value || 'N/A';
  const rtScore = rtRating === 'N/A' ? 0 : parseInt(rtRating);
  const isFresh = rtScore >= 60;

  // URL encode the movie title for the JustWatch link
  const encodedTitle = encodeURIComponent(movieData.Title);

  const item = `
    <li class='bg-white shadow-2xl mb-6 pb-6 flex flex-col rounded-lg overflow-hidden' id='${movieData.imdbID}'>
      <img loading='lazy' src='${movieData.Poster}' class='w-full'>
      <div class='flex flex-col gap-2 my-6 mb-4 px-6'>
        <h1 class='text-4xl font-bold leading-none'>${movieData.Title}</h1>
        <p class='pill inline-block rounded bg-[#4deeea] px-2 py-1 mt-1 expanded text-black whitespace-nowrap self-start'>
          ${movieData.Year}
        </p>
      </div>
      <div class='px-6 text-gray-500 flex flex-col flex-grow *:flex-grow'>
        <p class="line-clamp-3 text-[#746BD9]">${movieData.Plot}</p>
        <p class="text-sm mt-2 text-gray-600 font-bold text-[1rem]">${movieData.Actors.split(', ').slice(0, 5).join(', ')}</p>
        <a href="https://www.justwatch.com/us/search?q=${encodedTitle}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 mt-4 text-[#746BD9] hover:underline w-full bg-[#4deeea]/30 hover:bg-black justify-center text-lg rounded-lg p-4 expanded">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
  <path d="M19.5 6h-15v9h15V6Z" />
  <path fill-rule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6A.75.75 0 0 0 6 21h12a.75.75 0 0 0 0-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375Zm0 13.5h17.25a.375.375 0 0 0 .375-.375V4.875a.375.375 0 0 0-.375-.375H3.375A.375.375 0 0 0 3 4.875v11.25c0 .207.168.375.375.375Z" clip-rule="evenodd" />
</svg>
Where to Stream</a>
        <div class='flex !flex-grow-0 justify-between gap-6 border-t pt-4 mt-4'>
          <p class='text-gray-500' title='Watch Date'>
          <svg class='inline w-5 h-5 relative -top-0.5 fill-[#746BD9]' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
  <path fill-rule='evenodd' d='M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z' clip-rule='evenodd' />
</svg>

          
            &nbsp;<strong>${isPastMovie ? 'Watched:' : 'Watch:'}</strong> ${formattedDate}
          </p>
          <p class='text-gray-500' title='Rotten Tomatoes Rating'>
            ${isFresh ? 
              `<svg class='fresh inline w-5 h-5 relative -top-0.5' type="certified" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g transform="translate(2.29, 0)">
                  <path d="M42.1942857,18.8022857 C44.3794286,18.608 49.1565714,18.7177143 51.4902857,21.0057143 C51.6297143,21.1451429 51.5085714,21.4605714 51.3097143,21.408 C47.8902857,20.4868571 42.5577143,25.0217143 39.1017143,22.0891429 C39.008,22.9485714 38.2331429,27.0857143 32.3314286,26.4731429 C32.192,26.4594286 32.1371429,26.304 32.24,26.2171429 C33.1542857,25.44 34.2765714,23.2891429 33.3142857,21.9154286 C30.3108571,23.9085714 28.7565714,23.9954286 23.2182857,21.5954286 C23.0377143,21.5177143 23.1451429,21.2228571 23.3577143,21.1748571 C24.5074286,20.9165714 27.2434286,19.9222857 29.696,19.4582857 C30.1645714,19.3691429 30.624,19.3165714 31.0674286,19.312 C28.528,18.7062857 27.4217143,18.1805714 25.7485714,18.1874286 C25.5657143,18.1897143 25.4742857,17.9611429 25.6068571,17.8354286 C28.224,15.3188571 32.9691429,15.1885714 35.2548571,17.0628571 L33.2068571,12.7862857 L35.696,12.4114286 C35.696,12.4114286 36.3451429,14.6925714 36.9257143,16.7428571 C39.5177143,13.904 43.5268571,14.192 44.8777143,16.672 C44.9577143,16.8182857 44.8251429,16.992 44.6605714,16.9622857 C43.3005714,16.7314286 42.3702857,17.8628571 42.1737143,18.7977143 L42.1942857,18.8022857 C44.3794286,18.608 49.1565714,18.7177143 51.4902857,21.0057143 C51.328,20.8502857 51.1337143,20.7245714 50.9508571,20.5874286 C60.2765714,23.504 66.7474286,30.1531429 67.44,41.2251429 C67.8811429,48.2948571 65.5702857,54.3885714 61.568,59.1154286 C62.784,59.2891429 63.9931429,59.4925714 65.2045714,59.6937143 C70.304,53.4537143 73.2502857,45.5428571 73.2502857,37.056 C73.2502857,17.7165714 57.5337143,2.56685714 37.472,2.56685714 C17.4102857,2.56685714 1.69371429,17.7165714 1.69371429,37.056 C1.69371429,45.5565714 4.64,53.472 9.744,59.7097143 C10.8434286,59.5268571 11.9451429,59.3462857 13.0491429,59.1817143" fill="#FFD700" mask="url(#mask-2)"></path>
                  <path d="M9.744,59.7097143 C4.64,53.472 1.69371429,45.5565714 1.69371429,37.056 C1.69371429,17.7165714 17.4102857,2.56685714 37.472,2.56685714 C57.5337143,2.56685714 73.2502857,17.7165714 73.2502857,37.056 C73.2502857,45.5428571 70.304,53.4537143 65.2045714,59.6937143 C65.8125714,59.7942857 66.4205714,59.8742857 67.0285714,59.984 C71.9497143,53.6457143 74.8937143,45.6982857 74.8937143,37.056 C74.8937143,16.3862857 58.1394286,0.921142857 37.472,0.921142857 C16.8022857,0.921142857 0.048,16.3862857 0.048,37.056 C0.048,45.7074286 2.99885714,53.6594286 7.92914286,59.9977143 C8.53257143,59.8902857 9.13828571,59.8102857 9.744,59.7097143" fill="#FA6E0F" mask="url(#mask-2)"></path>
                  <path d="M58.2857143,74.9394286 C62.3748571,75.1954286 65.7874286,77.2137143 67.8468571,79.9474286 C67.9131429,80.0182857 68.0114286,80.016 68.0411429,79.9382857 C68.7451429,77.0971429 68.9394286,74.0662857 68.5851429,71.0125714 C68.5874286,70.9805714 68.6125714,70.9577143 68.6537143,70.9485714 C70.576,70.3428571 72.7017143,70.0137143 74.9645714,70.0457143 C75.0857143,70.0594286 75.0834286,69.9405714 74.9554286,69.8194286 C72.5577143,67.4994286 69.6297143,65.6914286 66.416,64.5417143 C65.3051429,67.68 64.2217143,70.816 63.1565714,73.9634286 C63.136,74.0228571 63.0514286,74.0594286 62.9645714,74.0434286 L58.2857143,74.9394286" fill="#0AC855" mask="url(#mask-2)"></path>
                  <path d="M62.9645714,74.0434286 L58.2857143,74.9394286 C58.2857143,74.9394286 58.3451429,74.512 58.528,73.3325714 C60.9417143,73.6754286 62.9645714,74.0434286 62.9645714,74.0434286" fill="#0B4902"></path>
                  <g transform="translate(0, 20.57)">
                    <mask id="mask-4" fill="white">
                      <polygon points="0.137142857 0.016 67.4935952 0.016 67.4935952 59.2914286 0.137142857 59.2914286"></polygon>
                    </mask>
                    <path d="M13.0765714,38.6057143 C29.1177143,36.2605714 45.5222857,36.2354286 61.568,38.544 C65.5702857,33.8171429 67.8811429,27.7234286 67.44,20.6537143 C66.7474286,9.58171429 60.2765714,2.93257143 50.9508571,0.016 C51.1337143,0.153142857 51.328,0.278857143 51.4902857,0.434285714 C51.6297143,0.573714286 51.5085714,0.889142857 51.3097143,0.836571429 C47.8902857,-0.0845714286 42.5577143,4.45028571 39.1017143,1.51771429 C39.008,2.37485714 38.2331429,6.51428571 32.3314286,5.90171429 C32.192,5.888 32.1371429,5.73257143 32.24,5.64571429 C33.1542857,4.86857143 34.2765714,2.71542857 33.3142857,1.344 C30.3108571,3.33714286 28.7565714,3.424 23.2182857,1.024 C23.1725714,1.00342857 23.1908571,0.953142857 23.1794286,0.912 C10.2354286,5.51314286 6.912,14.6628571 7.51771429,24.3908571 C7.86971429,30.0091429 9.93142857,34.7748571 13.0765714,38.6057143" fill="#FA3200" mask="url(#mask-4)"></path>
                    <path d="M12.0868571,53.472 C12,53.488 11.9154286,53.4514286 11.8948571,53.392 C10.8274286,50.2445714 9.73485714,47.0971429 8.62171429,43.9611429 C5.41028571,45.1108571 2.49371429,46.9302857 0.0982857143,49.248 C-0.0297142857,49.3691429 -0.032,49.488 0.0891428571,49.4742857 C2.352,49.4422857 4.47771429,49.7714286 6.4,50.3771429 C6.44114286,50.3862857 6.46628571,50.4091429 6.46857143,50.4411429 C6.11428571,53.4948571 6.30857143,56.5257143 7.01257143,59.3668571 C7.04228571,59.4445714 7.14057143,59.4468571 7.20685714,59.376 C9.26628571,56.6422857 12.6742857,54.624 16.7657143,54.368 L12.0868571,53.472" fill="#0AC855" mask="url(#mask-4)"></path>
                  </g>
                  <path d="M62.9645714,74.0434286 C46.192,71.104 28.8571429,71.104 12.0868571,74.0434286 C12,74.0594286 11.9154286,74.0228571 11.8948571,73.9634286 C10.3428571,69.3851429 8.74285714,64.8182857 7.09257143,60.2628571 C7.06971429,60.1988571 7.14057143,60.1257143 7.248,60.1074286 C27.1885714,56.464 47.8605714,56.464 67.8034286,60.1074286 C67.9108571,60.1257143 67.9817143,60.1988571 67.9565714,60.2628571 C66.3085714,64.8182857 64.7085714,69.3851429 63.1565714,73.9634286 C63.136,74.0228571 63.0514286,74.0594286 62.9645714,74.0434286" fill="#00912D"></path>
                  <path d="M12.0868571,74.0434286 L16.7657143,74.9394286 C16.7657143,74.9394286 16.704,74.512 16.5211429,73.3325714 C14.1074286,73.6754286 12.0868571,74.0434286 12.0868571,74.0434286" fill="#0B4902"></path>
                </g>
              </svg>` :
              `<svg class='rotten inline w-5 h-5 relative -top-0.5' type="negative" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g transform="translate(0, 1.23)">
                  <g>
                    <mask id="mask-2" fill="white">
                      <polygon points="0 0.161950465 79.7417075 0.161950465 79.7417075 77.522807 0 77.522807"></polygon>
                    </mask>
                    <path d="M71.4638596,70.225614 C56.3459649,71.0192982 53.2568421,53.7203509 47.325614,53.8435088 C44.7982456,53.8964912 42.8063158,56.5389474 43.6810526,59.6185965 C44.1621053,61.3115789 45.4964912,63.794386 46.337193,65.3350877 C49.302807,70.7719298 44.9185965,76.9245614 39.7880702,77.4449123 C31.2621053,78.3098246 27.705614,73.3638596 27.925614,68.3007018 C28.1729825,62.6168421 32.9922807,56.8091228 28.0494737,54.3378947 C22.8694737,51.7480702 18.6585965,61.8754386 13.7017544,64.1357895 C9.2154386,66.1817544 2.9877193,64.5954386 0.773684211,59.6136842 C-0.781403509,56.1129825 -0.498596491,49.3722807 6.42526316,46.8003509 C10.7501754,45.1940351 20.3880702,48.9010526 20.8824561,44.205614 C21.4522807,38.7929825 10.7575439,38.3364912 7.53754386,37.0385965 C1.84,34.7424561 -1.52280702,29.8291228 1.11192982,24.5582456 C3.08877193,20.6045614 8.90526316,18.9957895 13.3449123,20.7277193 C18.6635088,22.8024561 19.517193,28.3189474 22.2421053,30.6129825 C24.5894737,32.5901754 27.8021053,32.8375439 29.9031579,31.4782456 C31.4526316,30.4754386 31.9684211,28.2729825 31.3838596,26.2610526 C30.6084211,23.5901754 28.5505263,21.9235088 26.542807,20.2905263 C22.9698246,17.3859649 17.925614,14.8884211 20.9768421,6.96035088 C23.4778947,0.463157895 30.8133333,0.229122807 30.8133333,0.229122807 C33.7277193,-0.0985964912 36.3375439,0.781403509 38.4642105,2.68140351 C41.3073684,5.22140351 41.8610526,8.61649123 41.3852632,12.2385965 C40.9505263,15.5449123 39.7803509,18.4407018 39.1701754,21.7164912 C38.4621053,25.5196491 40.4947368,29.3519298 44.3603509,29.5010526 C49.4449123,29.6975439 50.9694737,25.7894737 51.5915789,23.3122807 C52.5024561,19.6877193 53.6978947,16.322807 57.0617544,14.2035088 C61.8894737,11.1617544 68.5954386,11.8284211 71.7066667,17.674386 C74.1677193,22.3 73.3775439,28.6677193 69.6024561,32.1449123 C67.9087719,33.7045614 65.8722807,34.254386 63.6694737,34.2698246 C60.5105263,34.2922807 57.3529825,34.2147368 54.4207018,35.6929825 C52.4245614,36.6989474 51.5547368,38.3382456 51.5550877,40.5354386 C51.5550877,42.6768421 52.6698246,44.0754386 54.4761404,44.985614 C57.8782456,46.7003509 61.6336842,47.0508772 65.3087719,47.694386 C70.6382456,48.6277193 75.3242105,50.5049123 78.3326316,55.4505263 C78.3596491,55.4940351 78.3859649,55.5378947 78.4115789,55.5821053 C81.8666667,61.4375439 78.2533333,69.8687719 71.4638596,70.225614" fill="#0AC855" mask="url(#mask-2)"></path>
                  </g>
                </g>
              </svg>`
            }
            &nbsp;${rtRating}
          </p>
        </div>
      </div>
    </li>
  `;
  
  if (isPastMovie) {
    $("ul.past").append(item);
  } else {
    $("ul.upcoming").append(item);
  }
}

function getCurrentMovieIndex() {
  const now = new Date();
  // Find the first movie whose date is in the future
  const futureMovies = movieData.filter(movie => new Date(movie.date) > now);
  if (futureMovies.length > 0) {
    return movieData.indexOf(futureMovies[0]);
  }
  // If all movies are in the past, return the last one
  return movieData.length - 1;
}

// Notification Service
class NotificationService {
  constructor() {
    this.notificationPermission = Notification.permission;
    this.checkPermission();
    this.setupEventListeners();
    $('html').addClass('overflow-hidden'); // Add overflow-hidden on page load
  }

  setupEventListeners() {
    $('.start-button').on('click', () => {
      $('.welcome').addClass('hidden');
      $('html').removeClass('overflow-hidden'); // Remove overflow-hidden when welcome is hidden
      localStorage.setItem('welcomeHidden', 'true');
      this.checkPermission();
    });

    $('.help').on('click', (e) => {
      e.preventDefault();
      $('.welcome').removeClass('hidden');
      $('html').addClass('overflow-hidden'); // Add overflow-hidden when welcome is shown
      if (this.notificationPrompt) {
        this.notificationPrompt.remove();
      }
    });
  }

  async checkPermission() {
    this.notificationPermission = Notification.permission;
    // Only request permission if welcome is hidden and permission is default
    if (this.notificationPermission === 'default' && $('.welcome').hasClass('hidden')) {
      await this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      if (permission === 'granted') {
        this.scheduleNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  // Add test function that can be called from console
  testNotification() {
    if (this.notificationPermission !== 'granted') {
      console.log('Please enable notifications first');
      return;
    }

    console.log('Sending test notification...');
    const options = {
      body: 'This is a test notification!',
      icon: '/touch.png',
      badge: '/touch.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      renotify: true
    };

    try {
      // Use direct Notification API instead of service worker
      const notification = new Notification('Test Notification', options);
      console.log('Test notification sent successfully!');
      return notification;
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  scheduleNotifications() {
    if (this.notificationPermission !== 'granted') return;

    // Clear any existing notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        }
      });
    }

    // Schedule notifications for upcoming movies
    movieData.forEach(movie => {
      const watchDate = new Date(movie.date);
      const now = new Date();
      
      // Only schedule for future movies
      if (watchDate > now) {
        // Schedule for 9 AM on the watch date
        const notificationTime = new Date(watchDate);
        notificationTime.setHours(9, 0, 0, 0);
        
        const timeUntilNotification = notificationTime - now;
        if (timeUntilNotification > 0) {
          console.log(`Scheduled notification for ${movie.title} at ${notificationTime.toLocaleString()}`);
          setTimeout(() => {
            this.sendNotification(movie.title);
          }, timeUntilNotification);
        }
      }
    });
  }

  sendNotification(title) {
    if (this.notificationPermission !== 'granted') return;

    const options = {
      body: `It's time to watch ${title}!`,
      icon: '/touch.png',
      badge: '/touch.png',
      vibrate: [200, 100, 200],
      tag: `movie-${title}`,
      renotify: true
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Movie Time!', options);
      });
    } else {
      new Notification('Movie Time!', options);
    }
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Initialize notification service
const notificationService = new NotificationService();

// Update initializeMovies to schedule notifications
async function initializeMovies() {
  const sheetData = await fetchMoviesFromSheet();
  if (sheetData.length > 0) {
    movieData = sheetData;
    // Schedule notifications after movies are loaded
    notificationService.scheduleNotifications();
    
    // Rest of the existing initialization code...
    Promise.all(movieData.map(movie => fetchMovieData(movie.title)))
      .then(movieDataArray => {
        const currentIndex = getCurrentMovieIndex();
        console.log('Current index:', currentIndex);
        movieDataArray.forEach((movieData, index) => {
          if (movieData) {
            movieData.date = sheetData[index].date;
            displayMovie(movieData, index);
          }
        });
        // Mark the first upcoming movie as current
        $("ul.upcoming li:first").addClass("!border-[#4DEEEA] border-4 current");
      });
  } else {
    console.error('No movies found in the spreadsheet');
  }
}

// Start the process
initializeMovies();

// Check localStorage on page load
if (localStorage.getItem('hideWelcome') === 'true') {
  $('.welcome').addClass('hidden');
}
