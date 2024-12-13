import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import './App.css';

function App() {
  const [calendarTimes, setCalendarTimes] = useState({ minTime: '', maxTime: '' });
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadResources = async () => {
    try {
      const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Ressources', {
        method: 'GET',
        headers: {
          'X-API-KEY': 'ixa_FRQn7NvqsgnDbFeqQMbRQVL8pZCtTWP6uug899',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok');
      }
      const data = await response.json();
      const formattedResources = data.data.map(resource => ({
        id: resource.id,
        title: resource.title
      }));
      setResources(formattedResources);
    } catch (error) {
      console.error('Fehler beim Laden der Ressourcen:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Events', {
        method: 'GET',
        headers: {
          'X-API-KEY': 'ixa_FRQn7NvqsgnDbFeqQMbRQVL8pZCtTWP6uug899',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok');
      }
      const data = await response.json();
      // Keine manuelle +2-Stunden-Verschiebung mehr
      const formattedEvents = data.data.map(event => ({
        title: event.titelkalendereintrag,
        start: new Date(event.datefrom),
        end: new Date(event.dateto),
        resourceId: event.refB1f64c35
      }));             
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    }
  };

  // Funktion zum Aktualisieren der Daten
  const refreshData = async () => {
    await loadResources();
    await loadEvents();
  };

  useEffect(() => {
    // Initiales Laden der Ressourcen und Events
    refreshData();

    // Regelmäßiges Neuladen der Daten, z.B. alle 5 Minuten
    const refreshInterval = setInterval(refreshData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const { hours, minutes } = getPreviousHour(now);
      const minTimeDate = new Date(now.setHours(hours, minutes, 0, 0));
      const minTime = formatTime(minTimeDate.getHours(), minTimeDate.getMinutes());
      const endTime = new Date(minTimeDate.getTime() + 3 * 60 * 60 * 1000); // +3 Stunden
      const maxTime = formatTime(endTime.getHours(), endTime.getMinutes());
      setCalendarTimes({ minTime, maxTime });
    };

    updateTimes(); // Initial setzen der Zeiten
    const intervalId = setInterval(updateTimes, 30 * 1000); // Aktualisiert alle 30 Sekunden

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    hideLicenseMessage();
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    const timeIntervalId = setInterval(updateCurrentTime, 60 * 1000); // Aktualisiert die Uhrzeit jede Minute
    return () => clearInterval(timeIntervalId);
  }, []);

  function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  function getPreviousHour(date) {
    let hours = date.getHours();
    return { hours, minutes: 0 }; // Setzt Minuten auf 0
  }

  const formatDate = (date) => {
    return date.toLocaleString('de-DE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  function hideLicenseMessage() {
    var licenseMessageDivs = document.getElementsByClassName("fc-license-message");
    for (var i = 0; i < licenseMessageDivs.length; i++) {
        licenseMessageDivs[i].style.display = "none";
    }
  }

  if (!calendarTimes.minTime || !calendarTimes.maxTime) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: '95%', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0px', marginTop: '0px' }}>{formatDate(currentTime)}</h3>
        </div>

        <div style={{ marginBottom: '3px', marginTop: '0px' }}>
        <button
          onClick={refreshData}
          style={{
            backgroundColor: '#3788d8',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#2a6fa9')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#3788d8')}
        >
          Aktualisieren
        </button>
      </div>

        <div style={{ width: '99%' }}>
          <FullCalendar
            plugins={[resourceTimelinePlugin]}
            initialView="resourceTimelineDay"
            // Nutze lokale Zeitzone anstatt UTC
            timeZone="local"
            now={currentTime.toISOString()}
            resources={resources}
            events={events}
            nowIndicator={true}
            slotMinTime={calendarTimes.minTime}
            slotMaxTime={calendarTimes.maxTime}
            slotDuration={'00:30:00'}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            headerToolbar={false}
            resourceAreaWidth={'250px'}
            contentHeight={'auto'}
            resourceOrder='title'
          />
        </div>
      </header>
    </div>
  );
}

export default App;
