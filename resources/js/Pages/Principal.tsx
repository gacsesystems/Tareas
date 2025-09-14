import { useState } from "react";
import { TodayView } from "./TodayView";
import { WeeklyPlanView } from "./WeeklyPlanView";
import { Sidebar } from "./Sidebar";
import { ProjectsView } from "./ProjectsView";
import { InboxView } from "./InboxView";
import { HabitsView } from "./HabitsView";
import { FinancesView } from "./FinancesView";
import { CalendarView } from "./CalendarView";
import { JournalView } from "./JournalView";
import { DelegationView } from "./DelegationView";
import { EventsView } from "./EventsView";
import { TimeBlocksView } from "./TimeBlocksView";
import { FilesView } from "./FilesView";
import { ResourcesView } from "./ResourcesView";
import { PeopleView } from "./PeopleView";
import { Catalogos } from "./Catalogos";

const Principal: React.FC = () => {
  const [activeView, setActiveView] = useState("today");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {activeView === "today" ? (
          <TodayView />
        ) : activeView === "weekly" ? (
          <WeeklyPlanView />
        ) : activeView === "projects" ? (
          <ProjectsView />
        ) : activeView === "inbox" ? (
          <InboxView />
        ) : activeView === "habits" ? (
          <HabitsView />
        ) : activeView === "events" ? (
          <EventsView />
        ) : activeView === "timeblocks" ? (
          <TimeBlocksView />
        ) : activeView === "files" ? (
          <FilesView />
        ) : activeView === "resources" ? (
          <ResourcesView />
        ) : activeView === "people" ? (
          <PeopleView />
        ) : activeView === "finances" ? (
          <FinancesView />
        ) : activeView === "calendar" ? (
          <CalendarView />
        ) : activeView === "journal" ? (
          <JournalView />
        ) : activeView === "delegation" ? (
          <DelegationView />
        ) : activeView === "catalogos" ? (
          <Catalogos />
        ) : (
          <TodayView />
        )}
      </main>
    </div>
  );
};

export default Principal;
