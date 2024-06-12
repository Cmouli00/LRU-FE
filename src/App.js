// App.js
import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import './App.css';

function App() {
  const [singlekey, setsingleKey] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cacheData, setCacheData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5); 

  const [singleValue, setsingleValue] = useState('');


  useEffect(() => {
    fetchCacheData();
  }, []);

  useEffect(() => {
    let intervalId;
    if (cacheData.length > 0) {
      intervalId = setInterval(() => {
        fetchCacheData();
      }, 10000); 
    }

    return () => clearInterval(intervalId);
  }, [cacheData]);

  const fetchCacheData = async () => {
    try {
      const response = await axios.get('/cache/getall');
      if (response.data != null){
       setCacheData(response.data);
      } else {
        setCacheData([]);
      }
    } catch (error) {
      console.error('Error fetching cache data:', error);
    }
  };

  const handleGetValue = async () => {
    try {
      const response = await axios.get(`/cache/get/${singlekey}`);
      if (response.data.found) {
        fetchCacheData();
        setsingleValue(response.data.value)
        toast.success(`Value Found`);
      } else {
        setsingleValue('')
        toast.error('Key not found in the cache');
      }
    } catch (error) {
      console.error('Error getting value:', error);
    }
  };

  const handleSetValue = async (e) => {
    e.preventDefault(); 
    if (key.trim() === '' || value.trim() === '' || expiration === '') {
      toast.error('Input required');
      return;
    }

    if (expiration < 0) {
      toast.error('expiration is in negative');
      return;
    }

    try {
      await axios.post('/cache/set', { key, value, expiration });
      setKey('');
      setValue('');
      setExpiration('');
      fetchCacheData();
      toast.success('Value set successfully');
    } catch (error) {
      console.error('Error setting value:', error);
      toast.error('Error setting value');
    }
  };

  const handleDeleteKey = async (key) => {
    try {
      await axios.delete(`/cache/delete/${key}`);
      fetchCacheData();
      toast.success(`Cache deleted successfully`);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

    // Pagination
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = cacheData.slice(indexOfFirstEntry, indexOfLastEntry);
  
    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  

    return (
      <div className="app">
        <ToastContainer />
        <h1>LRUCache Management</h1>
        <div className="cache-form">
          <input
            type="text"
            placeholder="Key"
            value={singlekey}
            onChange={(e) => setsingleKey(e.target.value)}
          />
          <button onClick={handleGetValue}>Get Value</button>
          <p>{singleValue}</p>
        </div>
        <div className="cache-form">
          <input
            type="text"
            placeholder="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Expiration (seconds)"
            value={expiration}
            onChange={(e) => setExpiration(parseInt(e.target.value, 10))}
            required
          />
          <button onClick={handleSetValue}>Set Value</button>
        </div>
        <div className="cache-data">
          <h2>Current Cache Data</h2>
          {currentEntries.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Expiration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry) => (
                    <tr key={entry.key}>
                      <td>{entry.key}</td>
                      <td>{entry.value}</td>
                      <td>{format(new Date(entry.expiration), 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td>
                        <button onClick={() => handleDeleteKey(entry.key)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                {Array.from({ length: Math.ceil(cacheData.length / entriesPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={currentPage === index + 1 ? 'active' : ''}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>
    );
}

export default App;