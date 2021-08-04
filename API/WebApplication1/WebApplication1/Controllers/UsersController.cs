using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Model;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UsersController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]

        public JsonResult Get()
        {
            string query = @"
                select UserID as ""UserID"",
                        to_char(Date_Registration, 'YYYY-MM-DD') as ""Date_Registration"",
                        to_char(Date_Last_Activity, 'YYYY-MM-DD') as ""Date_Last_Activity""
                from Users
            ";
            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("UsersCon");
            NpgsqlDataReader myReader;
            using (NpgsqlConnection myCon = new NpgsqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (NpgsqlCommand myCommand = new NpgsqlCommand(query, myCon))
                {
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);

                    myReader.Close();
                    myCon.Close();

                }
            }

            return new JsonResult(table);
        }
         
        [HttpPost]
        public JsonResult Post(Users us)
        {
            string query = @"
                insert into Users(UserID, Date_Registration, Date_Last_Activity)
                values (@UserID, @Date_Registration, @Date_Last_Activity)
            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("UsersCon");
            NpgsqlDataReader myReader;
            using (NpgsqlConnection myCon = new NpgsqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (NpgsqlCommand myCommand = new NpgsqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserID", us.UserID);
                    myCommand.Parameters.AddWithValue("@Date_Registration", Convert.ToDateTime(us.Date_Registration));
                    myCommand.Parameters.AddWithValue("@Date_Last_Activity", Convert.ToDateTime(us.Date_Last_Activity));
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);

                    myReader.Close();
                    myCon.Close();

                }
            }

            return new JsonResult("Added Successfully");
        }

        [HttpPut]
        public JsonResult Put(Users us)
        {
            string query = @"
                update Users
                set Date_Registration = @Date_Registration,
                    Date_Last_Activity = @Date_Last_Activity
                where UserID=@UserID 
            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("UsersCon");
            NpgsqlDataReader myReader;
            using (NpgsqlConnection myCon = new NpgsqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (NpgsqlCommand myCommand = new NpgsqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserID", us.UserID);
                    myCommand.Parameters.AddWithValue("@Date_Registration", Convert.ToDateTime(us.Date_Registration));
                    myCommand.Parameters.AddWithValue("@Date_Last_Activity", Convert.ToDateTime(us.Date_Last_Activity));
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);

                    myReader.Close();
                    myCon.Close();

                }
            }

            return new JsonResult("Updated Successfully");
        }

        [HttpDelete("{id}")]
        public JsonResult Delete(int id)
        {
            string query = @"
                delete from Users
                where UserID=@UserID 
            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("UsersCon");
            NpgsqlDataReader myReader;
            using (NpgsqlConnection myCon = new NpgsqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (NpgsqlCommand myCommand = new NpgsqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserID", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);

                    myReader.Close();
                    myCon.Close();

                }
            }

            return new JsonResult("Deleted Successfully");
        }
    }
}
