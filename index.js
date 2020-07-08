const autocompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
        return `
        <img src="${imgSrc}">
        ${movie.Title} (${movie.Year})
 
        `
    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(serchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'a600ab9e',
                s: serchTerm
            }
        });
        if (response.data.Error) {
            return [];
        }
        return response.data.Search;
    }
}

createAutoComplete({
    ...autocompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onSelect(movie, document.querySelector('#left-autocomplete'), "left");
    },
});
createAutoComplete({
    ...autocompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onSelect(movie, document.querySelector('#right-autocomplete'), "right");
    },
});

let leftMovie;
let rightMovie;

const onSelect = async(movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'a600ab9e',
            i: movie.imdbID
        }
    });
    summaryElement.innerHTML = movieTemplate(response.data)
    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    if (leftMovie && rightMovie) {
        onComparison()
    }
}

const onComparison = () => {
    const leftSideStats = document.querySelectorAll('#left-autocomplete .notification');
    const rightSideStats = document.querySelectorAll('#right-autocomplete .notification')

    leftSideStats.forEach((leftStats, index) => {
        const rightStats = rightSideStats[index];
        const leftSideValue = parseInt(leftStats.dataset.value);
        const rightSideValue = parseInt(rightStats.dataset.value);

        if (leftSideValue < rightSideValue) {
            leftStats.classList.remove('is-primary');
            leftStats.classList.add('is-warning');

        } else {
            rightStats.classList.remove('is-primary');
            rightStats.classList.add('is-warning');
        }

    })
}

const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    let Awardscount = 0;
    const awards = movieDetail.Awards.split(' ').forEach((word) => {
        const value = parseInt(word);
        if (isNaN(value)) {
            return;
        } else {
            Awardscount = Awardscount + value;
        }
    });


    return `
    <article class="media">
               <figure class="media-left">
                   <p class="image">
                       <img src="${movieDetail.Poster}">
                   </p>
               </figure>
               <div class="media-content">
                  <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                  </div>
               </div>
    </article>
    <article data-value=${Awardscount} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>
    <article  data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
    `
}