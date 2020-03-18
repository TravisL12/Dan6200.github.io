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
    let url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":10,"after":"QVFETUI0VVVCNDI5SXFiMTZXWVdIY010dlZjVEtycDJsSGN4UjktY1lnT2F0NUl3QWw0OHdtWExhUWdvTjRnci1YSWNSaFlUcHFIZGRMNUtobUhURmJScg=="}`;

    try {
      let response = await fetch (url);
      if (response.status == 429) throw Error ('Too many requests... try again later');
      if (!response.ok) throw Error ('Page not found... try again');
      let obj = await response.json();
      setTimeout(container.innerHTML = "", 1000);
      for (let i = 0; i < obj.data.hashtag.edge_hashtag_to_media.edges.length; i++)
      {
          const src = obj.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
          let img = document.createElement('img')
          img.src = src;
          container.append(img);
          button.classList.remove('hidden');
      }
      togglePause();

      url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":5,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;

      let ranAlready = false;
      setTimeout(() => {
        document.addEventListener('scroll', pageLoader);
      }, 5000)
      function pageLoader() {
        
        if (ranAlready) return;
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
                const src = object.data.hashtag.edge_hashtag_to_media.edges[i].node.display_url;
                let img = document.createElement('img')
                img.src = src;
                container.append(img);
            }
            return object;
          }).then((obj) => {
            url = `https://www.instagram.com/graphql/query/?query_hash=463d0b9e24ab084f46514747d53bcb0d&variables={"tag_name":"${search.value.slice(1).toLowerCase()}","first":10,"after":"${obj.data.hashtag.edge_hashtag_to_media.page_info.end_cursor}"}`;
          })
                    
        }
        ranAlready = true;
        setTimeout(() => ranAlready = false, 1000);  
      }

    } catch (e) {
      alert (e);
      setTimeout(() => container.innerHTML = "", 500);
    }   

  }
  
}

        