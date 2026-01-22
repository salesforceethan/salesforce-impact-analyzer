trigger ClosedOpportunityTrigger on Opportunity (after insert, after update) {
List<Task> tasksToInsert = new List<Task>();

    for (Opportunity opp : Trigger.new) {

        // Condition 1: Stage is Closed Won
        Boolean isClosedWon = (opp.StageName == 'Closed Won');

        // Condition 2: Only create on:
        // - insert where it's already Closed Won
        // - update where it CHANGED to Closed Won
        Boolean becameClosedWon = false;

        if (Trigger.isInsert) {
            becameClosedWon = isClosedWon;
        } else if (Trigger.isUpdate) {
            Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
            becameClosedWon = isClosedWon && oldOpp.StageName != 'Closed Won';
        }

        if (becameClosedWon) {
            Task t = new Task();
            t.Subject = 'Follow Up Test Task';
            t.WhatId  = opp.Id;          // relate task to the Opportunity
            t.OwnerId = opp.OwnerId;     // optional, but nice: assign to opp owner
            tasksToInsert.add(t);
        }
    }

    if (!tasksToInsert.isEmpty()) {
        insert tasksToInsert;
    }
}