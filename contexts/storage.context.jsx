import * as React from 'react';
import { getStorage, setStorage, getStorageAll } from "../modules/storage";


const Context = React.createContext({ isLoaded: false, dataStorage: {}, deleteLink: () => {}, toggleField: () => {}});

export const StorageProvider = ({children}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [dataStorage, setDataStorage] = React.useState({});

    React.useEffect(() => {
        getStorageAll(['settings'])
            .then(data => {
            const { settings } = data;
            const { isBlocking, siteList } = settings;
            setDataStorage({ isBlocking, siteList });
            setIsLoaded(true);
            });
    },[]);

    React.useEffect(() => {
        const listenerFunc = (changes, namespace) => {
            if (changes['settings']) {
                const { oldValue, newValue } = changes.settings;
                const fields = ['isBlocking', 'siteList'];
                while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
                    fields.shift();
                }
                setDataStorage({ ...dataStorage, [fields[0]]: newValue[fields[0]]});
            }
        };
        chrome.storage.onChanged.addListener(listenerFunc);

        return () => chrome.storage.onChanged.removeListener(listenerFunc);
    }, [dataStorage]);

    const toggleField = (fieldName) => {
        const field = dataStorage[fieldName];
        getStorage('settings', data => {
            const settings = Object.assign(data.settings, { [fieldName]: !field });
            setStorage('settings', { settings }, () => {
                setDataStorage(settings);
            });
        })
    }
    
    const addSite = (url) => {
        getStorage('settings', data => {
            const oldSiteList = data.settings.siteList;
            if (!oldSiteList.includes(url)) {
                const settings = {...data.settings, siteList: data.settings.siteList.concat(url) };
                setStorage('settings', { settings }, () => {
                    setDataStorage(settings);
                });
            }
        })
    }

    const deleteLink = (url) => {
        getStorage('settings', data => {
            let { siteList } = data.settings;
            siteList = siteList.filter(siteURL => siteURL !== url);
            let settings = Object.assign({}, data.settings, { siteList });
            setStorage('settings', { settings });
        })
    }


    return (
        <Context.Provider value={{ isLoaded, dataStorage, deleteLink, toggleField, addSite }}>
            {children}
        </Context.Provider>
    );
};

export const useStorageContext = () => {
    return React.useContext(Context);
}