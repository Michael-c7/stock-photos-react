import React, { useState, useEffect } from 'react';

function App() {
// rate limit is 50 requests per hour

// urls
  let baseUrl ='https://api.unsplash.com'
  let searchPhotosUrl = '/search/photos?query='
  let photosUrl = '/photos'
  let clientIdUrl = 'client_id='
  let apiKey = process.env.REACT_APP_ACCESS_KEY
  let defaultSearchTerm = 'blue'

  const [searchTerm, setSearchTerm] = useState('')
  const [photoData, setPhotoData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [isError, setIsError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeUntilMoreRequests, setTimeUntilMoreRequests] = useState()

  const fetchPhotos  = async _ => {
    let url = ''
    if(searchTerm) {
      url = `${baseUrl}${searchPhotosUrl}${searchTerm}&${clientIdUrl}${apiKey}&page=${page}`
    } else {
      url = `${baseUrl}${searchPhotosUrl}${defaultSearchTerm}&${clientIdUrl}${apiKey}&page=${page}`
    }

    setLoading(true)
    try {
      const res = await fetch(url)
      const data = await res.json()
      setPhotoData((oldPhotos) => {
        if(searchTerm && page === 1) {
          return data.results
        } else {
          return [...oldPhotos, ...data.results]
        }
      })
      setLoading(false)
    } catch(error) {
      setLoading(false)
      setIsError(true)
      setErrorMsg(error.message)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    setPage(1)
    fetchPhotos()
  }


  useEffect(() => {
    const event = window.addEventListener('scroll', () => {
        if(searchTerm && !loading && window.innerHeight + window.scrollY > document.body.scrollHeight - 2) {
          console.log('helllo')
          setPage((oldPage) => {
            return oldPage + 1;
          })
        }
    });
    // cleanup
    return () => window.removeEventListener('scroll', event)
  }, [searchTerm])

  useEffect(() => {
    fetchPhotos()
  }, [page])



  useEffect(() => {
    let currentMin = new Date().toLocaleString().slice(13, 15)
    let fullMinute = 60
    setTimeUntilMoreRequests(fullMinute - currentMin)
  },[])



  

  return (
    <div className="app">
      {isError && (
        <div className='error-container'>
          <h2>{errorMsg}</h2>
        </div>
      )}

      <form className='form' onSubmit={handleSubmit}>
        <input 
          type='text' 
          placeholder='eg: city' 
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
         />
        <button type='submit'>Search</button>
      </form>

      <section className='photos-container'>
        <ul className='cards'>
          {isError ? (
          <div className='error-2'>
            <h2>rate limit is 50 requests per hour</h2>
            <h3>{timeUntilMoreRequests} minutes left until more requests</h3>
          </div>
          ) : photoData?.map((item, index) => {
              return (
                <li className='card' key={index}>
                  <img className='img' src={item.urls.regular} alt={item.alt_description}/>
                  <h2>{item.user.first_name}</h2>
                  <h3>{item.likes} likes</h3>
                  <a href={item.user.links.html} target='_blank' rel="noreferrer">
                    <img src={item.user.profile_image.medium} alt=''/>
                  </a>
                </li> 
              )
            })}
        </ul>
        {loading && <h1 className='loading'>Loading...</h1>}
      </section>
    </div>
  );
}

export default App;
