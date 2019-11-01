(() => {
  // A tiny provider to work with localStorage.
  const LOCAL_STORAGE = {
    get: (key) => JSON.parse(localStorage.getItem(key)),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  };

  // Constants and actions to manage views and likes.
  const STORAGE_KEY_VIEWS = 'views';
  const STORAGE_KEY_LIKES = 'likes';

  const getViews = () => LOCAL_STORAGE.get(STORAGE_KEY_VIEWS);
  const getLikes = () => LOCAL_STORAGE.get(STORAGE_KEY_LIKES);

  const setViews = views => LOCAL_STORAGE.set(STORAGE_KEY_VIEWS, views);
  const setLikes = likes => LOCAL_STORAGE.set(STORAGE_KEY_LIKES, likes);

  const appendView = view => setViews([...getViews(), view]);
  const appendLike = like => setLikes([...getLikes(), like]);

  const isViewed = view => getViews().includes(view);
  const isLiked = like => getLikes().includes(like);

  const getViewFromNode = node => node.getAttribute('data-post-id');
  const getLikeFromNode = node => node.querySelector('[data-likes-id]').getAttribute('data-likes-id');

  const changeViewState = (node, attribute) => {
    const viewsSelector = node.parentNode.querySelector('span.views');

    viewsSelector.classList.add('disabled');
    viewsSelector.setAttribute(attribute, 'Viewed!');
  };
  const changeLikeState = (node, attribute) => {
    node.classList.add('disabled');
    node.setAttribute(attribute, 'Liked!');
  };

  // General helpers.
  const increment = key => ({
    [key]: firebase.firestore.FieldValue.increment(1),
  });

  // Initialize the Firebase application.
  firebase.initializeApp({
    apiKey: 'AIzaSyBU5uBhgyJsZD-PHaUlPAvggDLa5Dt9c-k',
    authDomain: 'skramer-studio-bd9f1.firebaseapp.com',
    databaseURL: 'https://skramer-studio-bd9f1.firebaseio.com',
    projectId: 'skramer-studio-bd9f1',
    storageBucket: 'skramer-studio-bd9f1.appspot.com',
    messagingSenderId: '696606944540',
    appId: '1:696606944540:web:18e3fbd40a4a06f1',
  });

  const collection = firebase.firestore().collection('project');

  // Get views and likes from the firestore.
  collection.onSnapshot(result => result.forEach((doc) => {
    const data = doc.data();

    ['views', 'likes'].forEach(action => {
        const selector = document.querySelector(`[data-${action}-id="${doc.id}"]`);

        if (selector) {
            selector.textContent = data[action];
        }
    });
  }));

  // Increment views functionality.
  if (!getViews()) {
    setViews([]);
  }

  document.querySelectorAll('.increment-view').forEach(node => {
    if (!isViewed(getViewFromNode(node))) {
      node.addEventListener('click', ({ currentTarget }) => {
        const view = getViewFromNode(currentTarget);

        if (!isViewed(view)) {
          appendView(view);

          collection.doc(view).update(increment(STORAGE_KEY_VIEWS));

          changeViewState(node, 'data-original-title');
        }
      });
    } else {
      changeViewState(node, 'title');
    }
  });

  // Increment likes functionality.
  if (!getLikes()) {
    setLikes([]);
  }

  document.querySelectorAll('.increment-like').forEach(node => {
    if (!isLiked(getLikeFromNode(node))) {
      node.addEventListener('click', ({ currentTarget }) => {
        const like = getLikeFromNode(currentTarget);

        if (!isLiked(like)) {
          appendLike(like);

          collection.doc(like).update(increment(STORAGE_KEY_LIKES));

          changeLikeState(node, 'data-original-title');
        }
      });
    } else {
      changeLikeState(node, 'title');
    }
  });
})();
