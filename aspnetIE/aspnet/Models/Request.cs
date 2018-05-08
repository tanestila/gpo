using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace aspnet.Models
{
    public class Requestjson
    {
        [DataMember]
        public string data { get; set; }
    }
}