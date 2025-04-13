function getWeeksDiff(startDate, endDate) {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;

  return Math.round(Math.abs(endDate - startDate) / msInWeek);
}


var count = getWeeksDiff(new Date('2025-04-20'), new Date());

function getNextTuesday(date) {
  const resultDate = new Date(date);
  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const day = resultDate.getDay();
  // Calculate days until next Tuesday (2)
  const daysUntilTuesday = (2 - day + 7) % 7;
  resultDate.setDate(resultDate.getDate() + daysUntilTuesday);
  return resultDate;
}

function getEpisodeAirDate(episodeIndex) {
  const startDate = new Date('2025-04-20');
  const firstTuesday = getNextTuesday(startDate);
  const episodeDate = new Date(firstTuesday);
  episodeDate.setDate(firstTuesday.getDate() + (episodeIndex * 7));
  return episodeDate;
}

var episodes = [];

// Fetch episodes for The Pentaverate
fetch('https://api.tvmaze.com/shows/55796/episodes')
  .then(response => response.json())
  .then(data => {
    episodes = data;
    $.each(episodes, function(key, value) {
      const episodeAirDate = getEpisodeAirDate(key);
      var item = ("<li class='rounded-xl shadow-2xl mb-6 pb-6 flex flex-col' id='" + value.id + "'><img loading='lazy' src='" + value.image.original + "' class='w-full rounded-lg rounded-br-none rounded-bl-none'><div class='flex gap-6 justify-between my-6 mb-4 px-6'><h1 class='text-3xl font-bold leading-none'>" + value.name + "</h1><p class='pill inline-block rounded bg-blue-200 px-2 py-1 mt-1 font-medium text-blue-900 whitespace-nowrap self-start'>S" + value.season + " E" + value.number + "</p></div><div class='px-6 text-gray-500 flex flex-col flex-grow *:flex-grow'>" + value.summary + "<div class='flex !flex-grow-0 gap-6 border-t pt-4 mt-4'><p class='text-gray-500' title='Original Airdate'><svg class='inline w-5 h-5 relative -top-0.5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' /></svg> &nbsp;<strong>Watch on:</strong> " + episodeAirDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + "</p><p class='text-gray-500' title='Episode Rating'><svg class='inline w-5 h-5 relative -top-0.5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'><path stroke-linecap='round' stroke-linejoin='round' d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' /></svg> &nbsp;" + value.rating.average + "</p></div></div></li>");
  $("ul").append(item);
  });

    $("ul li:nth-child(" + count + ")").addClass("!border-blue-600 border-4 current");
    scroller();
  })
  .catch(error => console.error('Error fetching episodes:', error));

function scroller() {

  setTimeout(function() { 
        $([document.documentElement, document.body]).animate({
        scrollTop: 
 $(".current").offset().top - 100
    }, 200); 
  
    }, 1000);

}

scroller();
