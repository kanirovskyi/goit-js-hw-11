import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const URL = "https://pixabay.com/api/"
const KEY = "38239569-a616a60d76981440503c8357a";

const formId = document.querySelector(".search-form");
const inputData = document.querySelector('[searchQuery]');
const gallery = document.querySelector(".gallery");
const btnLoadmore = document.querySelector(".load-more");


//стартовые данные для поиска
let page = 1;
const per_page = 40;
let searchQuery = null;
let images = [];
let totalPages = 0;

//параментры поиска
// const searchParams = new URLSearchParams({
//     key: KEY,
//     image_type: "photo",
//     orientation: "horizontal",
//     safesearch: true,
//     page: page,
//     per_page: per_page
// })

formId.addEventListener("submit", onSearch);
btnLoadmore.addEventListener("click", onLoadMore);

hideLoadmore();

// подтягиваются данные из бек-енд
async function fetchImages(name, page, per_page) {
    try {
        // const response = await axios.get(`${URL}?${searchParams}Sq=${value}`)
        const response = await axios.get(`${URL}?key=${KEY}&q=${name}&page=${page}&per_page=${per_page}&image_type=photo&orientation=horizontal&safesearch=true`)
        return response

    } catch (error) {
        console.error(error)
    }
}

//функция поиска
async function onSearch(event) {
    event.preventDefault()
    
    cleanMarkUp();

    searchQuery = event.currentTarget.searchQuery.value.trim()

    showLoadmore();

    if (searchQuery === "") {

        cleanMarkUp();
        hideLoadmore();

        Notiflix.Notify.warning("Enter valid data")
        return
    }

    page = 1;
    const response = await fetchImages(searchQuery, page, per_page);
    const totalImages = response.data.totalHits;
    images = response.data.hits;
    totalPages = totalImages / per_page;

    if (images.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${totalImages} images.`)
        showLoadmore();

    } else {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.')

        hideLoadmore();
    }

    cleanMarkUp();
    render();

}

// загрузка дополнительных страниц/картинок при нажатии
async function onLoadMore() {
    page += 1;

    const response = await fetchImages(searchQuery, page, per_page);
    const totalImages = response.data.totalHits;
    images = response.data.hits;
    totalPages = totalImages / per_page;

    if (totalPages <= page) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")

        hideLoadmore();
    } 

    render();
    smoothScroll('.gallery');
}
    
//функция для рендера картинок
function render() {
    const items = images;
    const galleryMarkUp = items.map(templateImg).join('');
    gallery.insertAdjacentHTML('beforeend', galleryMarkUp);

    const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });

  const galleryImages = document.querySelectorAll('.gallery__image');
  galleryImages.forEach(image => {
    image.alt = image.alt.replace('${tags}', '');
  });

  lightbox.refresh();
}

//карточка картинки
function templateImg({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
    return `<div class="photo-card">
    <a class="gallery__item" href="${largeImageURL}" data-caption="Likes ${likes} | Views ${views} | Comments ${comments} | Downloads ${downloads}">
  <img src="${webformatURL}" alt="${tags}  &bull; Likes : ${likes}  &bull; Views : ${views}  &bull; Comments : ${comments}  &bull; Downloads : ${downloads}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`
}

function smoothScroll(obj) {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

//показать/скрыть кнопку "LOAD MORE"
function hideLoadmore() {
    btnLoadmore.style.display = "none";
}
function showLoadmore() {
    btnLoadmore.style.display = "block";
}

//чистим после себя DIV
function cleanMarkUp() {
    gallery.innerHTML = "";
}