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

  const [config, setConfig] = useState({
    locale: "en-us",
    rowHeaderColumns: [
      {name: "Date"},
      {name: "Day", width: 40}
    ],
    onBeforeRowHeaderRender: (args) => {
      args.row.columns[0].horizontalAlignment = "center";
      args.row.columns[1].text = args.row.start.toString("ddd");
      if (args.row.columns[2]) {
        args.row.columns[2].text = args.row.events.totalDuration().toString("h:mm");
      }
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
        {name: "Start", id: "start", type: "datetime"},
        {name: "End", id: "end", type: "datetime", onValidate: (args) => {
            if (args.values.end.getTime() < args.values.start.getTime()) {
              args.valid = false;
              args.message = "End must be after start";
            }
          }
        },
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
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        resource: args.resource,
        text: modal.result
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
          {name: "Day", width: 40}
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
    </div>
  );
}

export default Timesheet;
