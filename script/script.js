
let currentSong = new Audio()
let songs;
let currentFolder;

//function to convert seconds into minutes:seconds (03:54) format
function TimeFormat(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00"
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const formatedMinutes = String(minutes).padStart(2, "0")
  const formatedSeconds = String(remainingSeconds).padStart(2, "0")

  return `${formatedMinutes}:${formatedSeconds}`

}



async function getsongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text()
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  
  }

//play the first song of the playlist



  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = "";
  for (const element of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img src="Images/music-note-01-stroke-rounded.svg" alt="icons">
                        <div class="info">
                            <div>${element.replaceAll("%20", " ")}</div>
                            <div>Song Artist</div>
                        </div>
                        <div class = "playnow">
                        <img class="invert" src="Images/play-fill.svg" alt="icon" width="30px" >
                        </div> 
                        </li>`
  }
  //attach an event listner in each song

  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => (
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })

  ))
  return songs
}

function playMusic(track, pause = false) {
  // let audio = new Audio(/songs/ + track)
  currentSong.src = `/songs/NewArrival/${encodeURIComponent(track)}`

  if (!pause) {
    currentSong.play()
    playbtn.src = "Images/pause-circle.svg"
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
  let a = await fetch(`/songs/`)
  let response = await a.text()
  let div = document.createElement("div")
  div.innerHTML = response
  let cardcontainer = document.querySelector(".card-container")
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0]

      //get the meta data of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img class="invert" src="Images/play-fill.svg" alt="play">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`


    }
  }
  //load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })

}

async function main() {
  await getsongs("songs/NewArrival/info.json")
  playMusic(songs[0], true)

  //display the albums in the page
  displayAlbums()

  // attach an event listener  to play , next and previous
  playbtn.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      playbtn.src = "Images/pause-circle.svg"
    }

    else {
      currentSong.pause()
      playbtn.src = "Images/play-fill.svg"
    }
  })

  //listen for time update of a song
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${TimeFormat(currentSong.currentTime)}/${TimeFormat(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  })

  //add an eventlistner for seek bar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%"
    currentSong.currentTime = (currentSong.duration * percent) / 100

  })

  //add an event listener for hamburger icon {media querry <1300}
  document.querySelector(".hamburger-container").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //add an event listener for close buuton inside the hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%"
  })

  //add an evenrt listener to previous and next playbar buttons
  nextbtn.addEventListener("click", () => {
    console.log('clicked next button')

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])

    }
    console.log('length', songs.length)


  })
  previousbtn.addEventListener("click", () => {
    console.log('previous btn clicked');
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }

  })

  //add an event listner to the volume 
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100

  })

  //add event listner to mute the song
  document.querySelector(".volume>img").addEventListener("click",(e)=>{
 console.log('e', e)
  if(e.target.src.includes("speaker.svg")){
    e.target.src = e.target.src.replace("speaker.svg","mute.svg")
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  }
  else{
    e.target.src = e.target.src.replace("mute.svg","speaker.svg")
    currentSong.volume = 0.40;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
  }
  })


}



main()
