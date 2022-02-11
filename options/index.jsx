import * as React from 'react';
import { render } from 'react-dom';
import { useStorageContext, StorageProvider } from '../contexts/storage.context.jsx';

const App = () => {
  const [site, setSite] = React.useState();
  const { dataStorage, isLoaded, toggleField, deleteLink, addSite } = useStorageContext();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addSite(site);
    setSite("");
  }
  const { siteList, isBlocking } = dataStorage;
  return (
    <div>
      { isLoaded && <div className="main-content">
        <div className="switch-list-container">
          <div className="switch-container">
            Block Sites:
            <div className="switch">
              <div className="switch-show">SHOW</div>
              <div onClick={ () => toggleField('isBlocking') } className={`switcher_slider${isBlocking ? " checked" : ""}`}></div>
              <div className="switch-hide">HIDE</div>
            </div>
          </div>
        </div>
        <div className="site-menu">
          <div className="site-input">
            <form onSubmit={handleSubmit}>
              <label>
                <div>Enter website name (ex: www.reddit.com)</div>
                <input type="text" value={site} onChange={e => setSite(e.target.value)}/>
              </label>
            </form>
          </div>
          <br />
          <div className="site-list">
            {siteList.map(url => {
              return (
                <div style={{ display: "flex" }}>
                  {/* can use actual redirect when blocking is off, otherwise maybe just looks like a link? */}
                  <a href="#">{url}</a>
                  <div className="icon-container"
                        onClick={() => deleteLink(url)}>
                      <i className="far fa-times-circle"></i>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>}
    </div>
  );
}

const AppWrapper = () => {
  return (
    <StorageProvider>
      <App />
    </StorageProvider>
  );
}


render(<AppWrapper />, document.getElementById('root'));
