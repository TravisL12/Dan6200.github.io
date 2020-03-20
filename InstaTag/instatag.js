function startSlideShow() {
  'use strict';
  let scrollEvent = null;
  let pageLoader;
  let cachePageLoader = new Map ();

  const search = document.getElementById('search');
  const button = document.getElementById('button');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');
  
  document.onclick = (e) => {
    if (e.target.id == 'search') return;
    dropdown.classList.toggle('hidden', true);
  }
  document.onkeydown = (e) => {
    if (event.code == "Space") {
      togglePause();
      event.preventDefault();
      return;
    }
    if (e.target.id == 'search' && e.code != "Enter") return;
    dropdown.classList.toggle('hidden', true);
    if (e.code == 'ArrowLeft') window.scrollBy(-500, 0);
    
    if (e.code == 'ArrowRight') window.scrollBy(500, 0);
  }

  dropdown.onclick = (e) => {
    if (e.target.tagName != "P") return;
    search.value = e.target.firstChild.data.slice(1, -1);
    showSlides();
  } 
  
  search.onclick = () => {
    dropdown.classList.toggle('hidden');
    dropdown.style.top = search.getBoundingClientRect().bottom + 5 + 'px';
    dropdown.style.left = search.getBoundingClientRect().left + 'px';
  }

  let i = -1;
  search.onkeydown = e => {
    if (e.code == "Enter" || e.code == 'Tab') {
      showSlides();
      return;
    }
    if (e.code.slice(0,5) != 'Arrow') return;
      dropdown.classList.remove('hidden');
      dropdown.style.top = search.getBoundingClientRect().bottom + 5 + 'px';
      dropdown.style.left = search.getBoundingClientRect().left + 'px';
      if (e.code == 'ArrowDown') i++;
      if (e.code == 'ArrowUp') i--;
      let p = document.querySelectorAll('.dropdown > p');
      if (i > p.length-1) i = 0;
      if (i < 0) i = p.length-1;
      for (let elem of p) elem.style.backgroundColor = "";
      p[i].style.backgroundColor = 'rgba(0, 0, 0, 0.055)';
      search.value = p[i].firstChild.data.slice(1, -1);
    
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

  document.addEventListener('mousewheel', event => {               
    (event.deltaY > 0) ? window.scrollBy(100, 0) : window.scrollBy(-500, 0);                
  })

  submit.onclick = () => {
    showSlides();
  }

  let showSlides = async function () {
      // Buttons
    togglePause();
    if (scrollEvent) {
      document.removeEventListener('scroll', pageLoader);
      scrollEvent = false; 
      cachePageLoader.clear();
    }
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
      setTimeout(() => container.innerHTML = "", 1000);
      for (let i = 0; i < obj.data.hashtag.edge_hashtag_to_media.edges.length; i++)
      {
          let img = document.createElement('img');
          const src = obj.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
          img.src = src;
          setTimeout(() => container.append(img), 1000);
          button.classList.remove('hidden');
      }

      togglePause();

      url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":5,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;

      setTimeout(() => {
        document.addEventListener('scroll', pageLoader);
      }, 5000);

      pageLoader = function () {
        let scrollRight = document.documentElement.scrollWidth - (
          document.documentElement.scrollLeft + document.documentElement.clientWidth
        );
                
        if (scrollRight < 1500 && obj.data.hashtag.edge_hashtag_to_media.page_info.has_next_page) 
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
              let img = document.createElement('img');
              const src = object.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
              img.src = src;  
              container.append(img);            
            }
            return object;
          }).then((obj) => {
            url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":5,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;
          })           
        }
        scrollEvent = true;
      }

      let throttle = function (f, ms) {
        let throttled = false;
        return function wrapper() {
          if (throttled) {
            cachePageLoader.set(this, arguments);
            return;
          }
          f.apply(this, arguments);
          throttled = true;
          setTimeout(() => {
            throttled = false;
            if (!cachePageLoader.has(this)) return;
            wrapper.apply(this, cachePageLoader.get(this));
            cachePageLoader.clear();
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

        
