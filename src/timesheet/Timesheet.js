import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotScheduler } from "daypilot-pro-react";

const Timesheet = () => {

  const schedulerRef = React.createRef();
  const getScheduler = () => schedulerRef.current.control;

  const [showBusinessOnly, setShowBusinessOnly] = useState(false);
  const [showDailyTotals, setShowDailyTotals] = useState(false);

  const projects = [
    {id: 1, name: "Project A", color: "#38761d"},
    {id: 2, name: "Project B", color: "#0d8ecf"},
    {id: 3, name: "Project C", color: "#f1c232"},
  ];

  const generateTimeOptions = (start, end) => {
    const options = [];
    let currentTime = start;
    while (currentTime <= end) {
      options.push({name: currentTime});
      const [hour, minute] = currentTime.split(":").map(Number);
      if (minute + 15 >= 60) {
        currentTime = `${hour + 1}:00`;
      } else {
        currentTime = `${hour}:${minute + 15}`;
      }
    }
    return options;
  };

  const [config, setConfig] = useState({
    locale: "en-us",
    rowHeaderColumns: [
      {name: "Date"},
      {name: "Day", width: 40},
      {name: "Start Time", width: 80, type: "datetime", options: generateTimeOptions("07:00", "22:00")},
      {name: "End Time", width: 80, type: "datetime", options: generateTimeOptions("07:00", "22:00")}
    ],
    onBeforeRowHeaderRender: (args) => {
      args.row.columns[0].horizontalAlignment = "center";
      args.row.columns[1].text = args.row.start.toString("ddd");
    },
    onBeforeEventRender: (args) => {
      const duration = new DayPilot.Duration(args.data.start, args.data.end);
      const project = projects.find(p => p.id === args.data.project);
      args.data.barColor = project.color;
      args.data.areas = [
        {
          top: 13,
          right: 5,
          text: duration.toString("h:mm"),
          fontColor: "#999999"
        },
        {
          top: 5,
          left: 5,
          text: args.data.text,
        },
        {
          top: 20,
          left: 5,
          text: project.name,
          fontColor: "#999999"
        }
      ];
      args.data.html = "";
    },
    cellWidthSpec: "Auto",
    cellWidthMin: 25,
    timeHeaders: [{"groupBy":"Hour"},{"groupBy":"Cell","format":"mm"}],
    scale: "CellDuration",
    cellDuration: 15,
    eventHeight: 40,
    days: DayPilot.Date.today().daysInMonth(),
    viewType: "Days",
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    showNonBusiness: !showBusinessOnly,
    allowEventOverlap: false,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async (args) => {
      const dp = args.control;
      const form = [
        {name: "Text", id: "text"},
        {name: "Start Time", id: "start", type: "datetime", options: generateTimeOptions("07:00", "22:00")},
        {name: "End Time", id: "end", type: "datetime", options: generateTimeOptions("07:00", "22:00")},
        {name: "Project", id: "project", options: projects}
      ];
      const data = {
        start: args.start,
        end: args.end,
        project: projects[0].id,
        text: "New task"
      };
      const options = {
        locale: "en-us",
      };
      const modal = await DayPilot.Modal.form(form, data, options);
      dp.clearSelection();
      if (modal.canceled) { return; }
      dp.events.add({
        start: modal.result.start,
        end: modal.result.end,
        id: DayPilot.guid(),
        resource: args.resource,
        text: modal.result.text,
        project: modal.result.project
      });
    }
  });

  useEffect(() => {
    const events = [
      {
        id: 1,
        text: "Task 1",
        start: "2023-05-02T10:00:00",
        end: "2023-05-02T11:00:00",
        project: 1,
      },
      {
        id: 2,
        text: "Task 2",
        start: "2023-05-05T09:30:00",
        end: "2023-05-05T11:30:00",
        project: 2,
      },
      {
        id: 3,
        text: "Task 3",
        start: "2023-05-07T10:30:00",
        end: "2023-05-07T13:30:00",
        project: 3,
      }
    ];
    getScheduler().update({
      events,
      scrollTo: DayPilot.Date.today().firstDayOfMonth().addHours(9)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeBusiness = (e) => {
    setShowBusinessOnly(e.target.checked);
    setConfig(prevConfig => ({
      ...prevConfig,
      showNonBusiness: !e.target.checked
    }));
  }

  const changeSummary = (e) => {
    setShowDailyTotals(e.target.checked);

    if (e.target.checked) {
      setConfig(prevConfig => ({
        ...prevConfig,
        rowHeaderColumns: [
          {name: "Date"},
          {name: "Day", width: 40},
          {name: "Total", width: 60}
        ]
      }));
    }
    else {
      setConfig(prevConfig => ({
        ...prevConfig,
        rowHeaderColumns: [
          {name: "Date"},
          {name: "Day", width: 40},
          {name: "Start Time", width: 80, type: "datetime", options: generateTimeOptions("07:00", "22:00")},
          {name: "End Time", width: 80, type: "datetime", options: generateTimeOptions("07:00", "22:00")}
        ]
      }));
    }
  }

  return (
    <div>
      <div className={"space"}>
        <label><input type={"checkbox"} onChange={changeBusiness} checked={showBusinessOnly} /> Show only business hours</label>
        <label><input type={"checkbox"} onChange={changeSummary} checked={showDailyTotals} /> Show daily totals</label>
      </div>
      <DayPilotScheduler
        {...config}
        ref={schedulerRef}
      />
       <button
        className="submit-button"
        style={{
          position: 'fixed',
          bottom: '20px', // Adjust this value to change the vertical position
          right: '20px', // Adjust this value to change the horizontal position
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default Timesheet;
