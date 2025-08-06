using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Common.Enum
{
    /// <summary>
    ///     Assignment state: <br/>
    ///     Accepted: assignment is accepted by assignee <br/>
    ///     Waiting for acceptance: assignment has been just created and has not been responded by assignee <br/>
    /// </summary>
    public enum AssignmentStateEnum
    {
        WaitingForAcceptance = 1,
        Accepted = 2,
        Declined = 3,
        Returned = 4,
    }
}