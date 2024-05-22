import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import './App.css';

function App() {
  const [calendarTimes, setCalendarTimes] = useState({ minTime: '', maxTime: '' });
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetch('/api/resources');
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
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        const data = await response.json();
        console.log('Loaded events:', data); // Debug-Ausgabe

        const formattedEvents = data.data.map(event => ({
          title: event.titelkalendereintrag,
          start: event.datefrom,
          end: event.dateto,
          resourceId: event.refB1f64c35
        }));
        console.log('Formatted events:', formattedEvents); // Debug-Ausgabe

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error);
      }
    };

    loadResources();
    loadEvents();

    const updateTimes = () => {
      const now = new Date();
      const { hours, minutes } = getPreviousHour(now);
      const minTimeDate = new Date(now.setHours(hours, minutes, 0, 0));
      const minTime = formatTime(minTimeDate.getHours(), minTimeDate.getMinutes());
      const endTime = new Date(minTimeDate.getTime() + 3 * 60 * 60 * 1000);
      const maxTime = formatTime(endTime.getHours(), endTime.getMinutes());
      setCalendarTimes({ minTime, maxTime });
    };

    updateTimes();
    const intervalId = setInterval(updateTimes, 1 * 30 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    const timeIntervalId = setInterval(updateCurrentTime, 60 * 1000);

    return () => clearInterval(timeIntervalId);
  }, []);

  function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  function getPreviousHour(date) {
    let hours = date.getHours();
    return { hours, minutes: 0 };
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

  hideLicenseMessage();
  function hideLicenseMessage() {
    var licenseMessageDivs = document.getElementsByClassName("fc-license-message");
    for (var i = 0; i < licenseMessageDivs.length; i++) {
      licenseMessageDivs[i].style.display = "none";
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: '95%', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '10px', marginTop: '0px' }}>{formatDate(currentTime)}</h3>
        </div>
        <div style={{ width: '99%' }}>
          <FullCalendar
            plugins={[resourceTimelinePlugin]}
            initialView="resourceTimelineDay"
            timeZone="UTC"  // Sicherstellen, dass die Zeitzone korrekt ist
            now={currentTime.toISOString()} // Manuell die aktuelle Zeit setzen
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
