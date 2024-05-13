import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import './App.css';

const eventDate = new Date("2024-05-10T12:00:00Z");

function App() {
  const [calendarTimes, setCalendarTimes] = useState({ minTime: '', maxTime: '' });
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Lade die Ressourcen
    const loadResources = async () => {
      try {
        const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Ressources', {
          headers: {
            'X-API-KEY': 'ixa_2MzzjXQGwkhBH3tM6VgXk2LYSZeVzuUezbdiEp'
          }
        });
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        const data = await response.json();
        const formattedResources = data.data.map(resource => ({
          id: resource.id,
          title: resource.title // Verwende das richtige Feld "title"
        }));
        setResources(formattedResources);
      } catch (error) {
        console.error('Fehler beim Laden der Ressourcen:', error);
      }
    };

    // Lade die Events
    const loadEvents = async () => {
      try {
        const response = await fetch('https://portal.kreis-rd.local/api/app/8F6FD6987CA7968D9D3334EC221BA3671F4D7D02/Events', {
          headers: {
            'X-API-KEY': 'ixa_2MzzjXQGwkhBH3tM6VgXk2LYSZeVzuUezbdiEp'
          }
        });
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        const data = await response.json();
        const formattedEvents = data.data.map(event => ({
          title: event.titelkalendereintrag,
          start: event.datefrom,
          end: event.dateto,
          resourceId: event.refB1f64c35
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error);
      }
    };

    loadResources();
    loadEvents();

    const updateTimes = () => {
      console.log("Updating times...");
      const now = new Date();
      const { hours, minutes } = getPreviousFiveMinutes(now);
      const minTimeDate = new Date(now.setHours(hours, minutes, 0, 0));
      const minTime = formatTime(minTimeDate.getHours(), minTimeDate.getMinutes());
      const endTime = new Date(minTimeDate.getTime() + 3 * 60 * 60 * 1000); // +3 Stunden
      const maxTime = formatTime(endTime.getHours(), endTime.getMinutes());
      console.log("minTime:", minTime, "maxTime:", maxTime);
      setCalendarTimes({ minTime, maxTime });
    };

    updateTimes(); // Initial setzen der Zeiten
    const intervalId = setInterval(updateTimes, 10 * 60 * 1000); // Aktualisiert alle 1 Minute

    return () => clearInterval(intervalId); // Cleanup der Interval
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    const timeIntervalId = setInterval(updateCurrentTime, 60 * 1000); // Aktualisiert die Uhrzeit jede Minute

    return () => clearInterval(timeIntervalId); // Cleanup der Interval
  }, []);

  function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  function getPreviousFiveMinutes(date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
    minutes = Math.floor(minutes / 5) * 5;
    return { hours, minutes };
  }

  if (!calendarTimes.minTime || !calendarTimes.maxTime) {
    return <div>Loading...</div>;
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

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: '95%', textAlign: 'center'}}>
          <h3 style={{ marginBottom: '10px', marginTop: '0px'}}>{formatDate(currentTime)}</h3>
        </div>
        <div style={{ width: '99%' }}>
          <FullCalendar
            plugins={[resourceTimelinePlugin]}
            initialView="resourceTimelineDay"
            resources={resources}
            events={events}
            slotMinTime={calendarTimes.minTime}
            slotMaxTime={calendarTimes.maxTime}
            slotDuration={'00:05:00'} // 5-Minuten-Intervalle
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            headerToolbar={false}
            resourceAreaWidth={'250px'} // Dynamische Breite
            contentHeight={'auto'}
            resourceOrder='title' // Sortiere die Ressourcen nach Titel
            nowIndicator={true}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
