// import styles
import './styles/style.scss';

import * as interact from 'interactjs';
import axios from 'axios';

let username;
let timer;
let counter;
let pieces;
let score;

window.onload = function () {
  
  const img = new Image();
  img.src = './img/kotel.jpg';
  const imgUrls = [];

  const userForm = document.querySelector('#user_form');
  userForm.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector('#username');
    username = input.value;
    counter = new Date();
    timer = setInterval(() => {
      const now = new Date();
      const time = now - counter;
      const _counter = document.querySelector('#counter');
      let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((time % (1000 * 60)) / 1000);
      minutes = minutes <= 9 ? `0${minutes}` : minutes;
      seconds = seconds <= 9 ? `0${seconds}` : seconds;
      _counter.innerHTML = `${minutes}:${seconds}`;
      score = time;
    }, 1000);
    document.querySelector('#name').innerHTML = username;
    document.querySelector('#name').innerHTML = username;
    hide(document.querySelector('#user_form'));
    show(document.querySelector('#user_info'));
    interact('.draggable').draggable(true);
  });

  imgLoad(img).then((loadedImage) => {
    for (let i = 0, x = 0, y = 0; i < 9; i++ , x += 130) {
      if (i !== 0 && i % 3 === 0) {
        x = 0;
        y += 130;
      }
      const canvas = document.createElement('canvas');
      canvas.height = 130;
      canvas.width = 130;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImage, x, y, 130, 130, 0, 0, 130, 130);
      imgUrls.push(canvas.toDataURL());
    }
    pieces = imgUrls.length;
  }).then(() => {
    const dropzoneWrapper = document.querySelector('#dropzone_wrapper');
    for (let i = 0; i < 9; i++) {
      const dropzone = document.createElement('div');
      dropzone.classList.add('dropzone');
      dropzone.setAttribute('id', `dropzone-${i}`);
      dropzone.style.background = `url(${imgUrls[i]}) center center no-repeat`;
      dropzone.style.backgroundSize = `cover`;
      dropzoneWrapper.appendChild(dropzone);
    }
  }).then(() => initDropzones(pieces)).then(() => initDragzones(imgUrls));

  const save = document.querySelector('#save');
  save.addEventListener('click', saveScore);
}

function imgLoad(img) {
  return new Promise((resolve, reject) => {
    img.onload = function () {
      resolve(this);
    };
  });
}

function initDragzones(imgUrls) {
  interact('.draggable')
    .draggable({
      enabled: false,
      inertia: true,
      restrict: {
        restriction: document.body,
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onmove: dragMoveListener,
      onend: function (event) {
        const target = event.target;
        if(!target.classList.contains('active')) {
          const x = (parseFloat(target.getAttribute('data-start-x')) || 0);
          const y = (parseFloat(target.getAttribute('data-start-y')) || 0);
          setCoordinates(target, x, y);
        }
      }
    });

  function dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    setCoordinates(target, x, y);
  }

  const dragzoneWrapper = document.querySelector('#dragzone_wrapper');
  for (let i = 0; i < 9; i++) {
    const draggable = document.createElement('div');
    draggable.classList.add('draggable');
    draggable.setAttribute('id', `draggable-${i}`);
    draggable.style.background = `url(${imgUrls[i]}) center center no-repeat`;
    const x = random(0, 260);
    const y = random(0, 170);
    setCoordinates(draggable, x, y);
    draggable.setAttribute('data-start-x', x);
    draggable.setAttribute('data-start-y', y);
    dragzoneWrapper.appendChild(draggable);
  }
}

function setCoordinates(element, x, y) {
  // translate the element
  element.style.webkitTransform =
    element.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  element.setAttribute('data-x', x);
  element.setAttribute('data-y', y);
}

function initDropzones(pieces) {
  const dropzones = document.querySelectorAll('.dropzone');

  for (let dropzone of dropzones) {

    const id = dropzone.getAttribute('id');
    const draggableId = id.split('dropzone-').pop();

    interact(`#${id}`).dropzone({
      accept: `#draggable-${draggableId}`,
      overlap: 0.75,
      ondropactivate: function (event) {
        event.relatedTarget.classList.remove('dropped');
        event.target.classList.remove('active');
      },
      ondragenter: function (event) {
      },
      ondragleave: function (event) {
      },
      ondrop: function (event) {
        event.relatedTarget.classList.add('dropped');
        event.target.classList.add('active');
        pieces--;
        if(pieces === 0) {
          puzzleDone(timer);
        }
      },
      ondropdeactivate: function (event) {
      }
    });
  }
}

function puzzleDone(timer) {
  show(document.querySelector('#puzzle_done'));
  clearTimeout(timer);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function hide(element) {
  element.style.visibility = 'hidden';
  element.style.opacity = 0;
  element.style.height = 0;
}

function show(element) {
  element.style.visibility = 'visible';
  element.style.opacity = 1;
  element.style.height = 'inherit';
}

function saveScore () {
  return axios.post(`http://localhost:3000/users`, {
    name: username,
    score
  })
}