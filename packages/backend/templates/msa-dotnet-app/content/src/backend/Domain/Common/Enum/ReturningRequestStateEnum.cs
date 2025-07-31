using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common.Enum
{
    /// <summary>
    ///     It allows to complete only ‘Waiting for returning’ requests <br/>
    ///     After request for returning asset is completed, asset is available <br/>
    /// </summary>
    public enum ReturningRequestStateEnum
    {
        WaitingForReturning = 1,
        Completed = 2,
    }
}
