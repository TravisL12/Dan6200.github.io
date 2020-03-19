function startSlideShow() {
  'use strict';
  const search = document.getElementById('search');
  const button = document.getElementById('button');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');

  search.onclick = null;
  search.onkeydown = e => {
    if (e.code == "Enter") showSlides();
    let keys = new Map();
    keys.set('Tab', "#fashion");
    if (e.code == 'Tab') {
        e.preventDefault();
        if (keys.has(e.code)) {
          search.value = keys.get(e.code);
        }
    }
  }

  let t,
  paused = true;

  function scroller () {
    t = setInterval(() => {
        window.scrollBy(1, 0);
    }, 10);
  }

  function togglePause() {
    if (paused) {
        clearInterval(t);
        paused = !paused;
    }
    else {
        scroller();
        paused = !paused;
    }
    toggleButton();
  }

  function toggleButton () {
    play.classList.toggle('hidden');
    pause.classList.toggle('hidden');
  }

  button.onclick = () => {
    togglePause();
  }

  document.addEventListener('keydown', event => {
    if (event.code == "Space") {
      togglePause();
      event.preventDefault();
    }
  })

  document.addEventListener('mousewheel', event => {               
    (event.deltaY > 0) ? window.scrollBy(100, 0) : window.scrollBy(-500, 0);                
  })

  submit.onclick = () => showSlides();

  
  let showSlides = async function () {
      // Buttons
    togglePause();

    // check searchbar format
    if(search.value[0] != '#') {
      alert("Not a hashtag...");
      return;
    }
    
    // Placeholder spinner
    container.innerHTML = `<img src="./placeholder.svg" width="128" height="128" data-src="real.jpg">`;
    // url
    let url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":10,"after":"QVFCcjBlb29kYy1zcTdETWdGenZGMWRndEpwZHJ6R0RsVlpvc0U2S05mTng3aWtWa0RHdnFMejJoR1BRZmxfOFdyUTlWUjJRR09YamF4ZXNvR1R2SzJESQ=="}`;

    try {
      let response = await fetch (url);
      if (response.status == 429) throw Error ('Too many requests... try again later');
      if (!response.ok) throw Error ('Page not found... try again');
      let obj = await response.json();
      container.innerHTML = "";
      for (let i = 0; i < obj.data.hashtag.edge_hashtag_to_media.edges.length; i++)
      {
          let img = document.createElement('img')
          const src = obj.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
          img.src = src;
          container.append(img);
          button.classList.remove('hidden');
      }
      togglePause();

      url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":5,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;

      
      setTimeout(() => {
        document.addEventListener('scroll', pageLoader);
      }, 3000)
      function pageLoader() {
        let scrollRight = document.documentElement.scrollWidth - (
          document.documentElement.scrollLeft + document.documentElement.clientWidth
        );
                
        if (scrollRight < 1000 && obj.data.hashtag.edge_hashtag_to_media.page_info.has_next_page) 
        {
          container.insertAdjacentHTML('beforeend', `<img src="placeholder.svg" width="128" height="128" data-src="real.jpg">`);

          fetch(url)
          .then(
            r => {
              if (r.status == 429) throw Error ('Too many requests... try again later');
              if (!r.ok) throw Error ('Page not found... try again');
              return r.json();
            }
          ).then(object => {
            let img = document.querySelector('img[src*="placeholder"]');
            img.remove();
            for (let i = 0; i < object.data.hashtag.edge_hashtag_to_media.edges.length; i++)
            {
              let img = document.createElement('img')
              container.append(img); 
              const src = object.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
              img.src = src;               
            }
            return object;
          }).then((obj) => {
            url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":10,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;
          })           
        }
      }

      let throttle = function (f, ms) {
        let throttled = false;
        let cache = new Map ();
    
        return function wrapper() {
          if (throttled) {
            cache.set(this, arguments);
            return;
          }
    
          f.apply(this, arguments);
          throttled = true;
          setTimeout(() => {
            throttled = false;
            if (!cache.has(this)) return;
            wrapper.apply(this, cache.get(this));
            cache.clear();
          }, ms);
        }
      };

      pageLoader = throttle (pageLoader, 2000);

    } catch (e) {
      alert (e);
      setTimeout(() => container.innerHTML = "", 500);
    }   

  }
  
}

        
