import "@fontsource/roboto";
import "@fontsource/roboto-condensed";
import "@fontsource/roboto-flex";
import "@fontsource/roboto-serif";
import './src/stylesheets/style.css';
import 'ol/ol.css';
import initconfig from './src/config.js';
import netWorker from './src/workers/networker?worker';
import syncWorker from './src/workers/syncworker?worker';
import reqWorker from './src/workers/reqworker?worker';

import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { transform } from 'ol/proj';

if('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let registeredSW;
      if (import.meta.env?.DEV){
        registeredSW = await navigator.serviceWorker.register('./src/workers/service-worker.js', {
          type: 'module',
        });
      } else {
        registeredSW = await navigator.serviceWorker.register('/service-worker.js');
      }
      //console.log('Service worker registered! 😎', registeredSW);
    } catch (err){
      //console.log('😥 Service worker registration failed: ', err);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const workers = [netWorker, syncWorker, reqWorker];
  const toggleSidebarBtn = document.querySelector('.mobile-menu-button');
  const prefsTogglerBtn = document.querySelector('.main-application-submenu-toggler');
  const sideBar = document.querySelector('.sidebar');
  const mainView = document.getElementById('mainview');
  const prefsSubmenus = document.getElementById('preferences-submenus');
  const collapseIcon = document.querySelector('.icon-collapse-updown');
  toggleSidebarBtn.addEventListener('click', () => {
    document.querySelector('.mobile-top-brand-nav').classList.toggle('hidden');
    document.querySelector('.slide-aside-button-icon').classList.toggle('button-forwardburger');
    document.querySelector('.slide-aside-button-icon').classList.toggle('button-backburger');
    setTimeout(() => {
      sideBar.classList.toggle('-translate-x-full');
      mainView.classList.toggle('hidden');
    }, 100);
  });
  prefsTogglerBtn.addEventListener('click', () => {
    prefsSubmenus.classList.toggle('hidden');
    prefsSubmenus.classList.toggle('-translate-y-full');
    collapseIcon.classList.toggle('rotate-180');
  });
  let map;
  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    controls: defaultControls({zoom: false,}),
    view: new View({
      center: transform([110.367088, -7.782928], 'EPSG:4326','EPSG:3857'),
      zoom: 11
    })
  });
  map.once('postrender', function(e){
    e.stopPropagation();
    this.updateSize();
    return false;
  });
  map.on('moveend', function(e){
    e.stopPropagation();
    this.updateSize();
    return false;
  });
});
