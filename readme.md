A KPILibrary for Service Now.
------------------------------
<pre>
   
     __           __  __      __             __  ___ __       __  ___        __      
|__/|__)|   |   ||__)|__) /\ |__)\ /   __   /__`|__ |__)\  /|/  `|__    |\ |/  \|  | 
|  \|   |   |___||__)|  \/~~\|  \ |         .__/|___|  \ \/ |\__,|___   | \|\__/|/\| 
                                                                                     


</pre>

Introduction:
-------------
A simple script include which will have methods for getting *Key Perfomance Indicators* for Service Now ITSM tool.

KPIs will differ for different organizations/customers,though the idea is to encompass all of them, the main idea is to have those KPIs which are used across most of the organizations/customers at one place.

This will be helpful when  - You are writing custom charts for Service Now.Though you can get most of the KPI's from reports with less(no) scripting, this Script Include aims to get the same data through Scripting for use to write Custom Charts.

The data returned from this Script Include will either be in JSON format, or will be retured as a comma seperated string, But JSON is preferred.


Usage:
------

           var KPILibrary = new KPILibrary(tableName,span,unitOfMeasure)
           
    * tableName - The tablename on which you want to know the KPI 
    * unitOfMeasure - Years/Months/Weeks
    * span - The interval of unitOfMeasure e.g., for every 4 weeks, or for every 5 years etc. 

This Script Include will as of today have 5 member variables.
    
    *  this.tableName  - The table name which will be referred in all the methods of this Script Include.
    *  this.dur - This contains the Span Attribute explained above.
    *  this.uom - This stored the unitOfMeasure explained above.
    *  this.weeks - This stores the data resulting after processing both span and unitOfMeasureexample: I want to know KPI for 4 weeks before today. 4 is the span and weeks is unitOf measure. Then this.weeks will contain - this weeks start date(20-5-2013) and 3 weeks before this week(13-5-2013, 6-5-2013 .. so on)
    *  this.log - Log to store any errors/logs to be shown/sent to the user.



Currently supports these functions:
-----------------------------------
 *   *weeklyTrend* - This function will give you the trend of number of tickets belonging to a     particular duration(default is 4 weeks). For example, It gives the number of open/closed tickets over a period of 4 weeks before today, including this week.Though the Script Include KPILibrary supports only weeklyTrend, I will in some time add a yearly support too.

	Usage:  
    '''
	Input parameters: Startweek - This parameter is to specify from when you want you calculation to start. As of now, weeklyTrend returns nothing. This is a TODO. So you can just skip this parameter.

	Output Parameters: A JSON String :[{"open":[{"name":"value"},{},{}]},{"closed":[{},{},{},{}]}]

	Example: new KPILibrary('incident').weeklyTrend();

	Output : [{"open":[{"2013-05-20":"3"},{"2013-05-13":"3"},{"2013-05-06":"3"},{"2013-04-29":"3"}]},{"closed":[{},{},{},{}]}]
     '''

Notice the date is in yyyy-mm-dd format.You should use the same format as well.



*    *fieldTrend* - This function returns trend between a particular field and its choices,
	   for example : priority and its choices(comma separated string) - Priority 1, 2, 3 or whatever needs to be passed.It retuns the count of those choices.

	   Usage:
       '''
	   Input Parameters: fieldName and choices(like priority)
	   OutputParameters: {"fieldName":[{"choice1":"numberoftickets"},{"choice2":"numberoftickets2"}]}

	   Example: new KPILibrary('incident').weeklyTrend('priority','1,2,3'); //1, 2, 3 are Priority values for Incident table.

	   Output:{"priority":[{"1":"25"},{"2":"32"},{"3","345"}]}
       '''




