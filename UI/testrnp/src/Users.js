import React, {Component} from "react";
import { variables } from "./Variables";
import { Bar } from "react-chartjs-2";


export class User extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users:[],
            modalTitle:"",
            UserID:0,
            Date_Registration: "",
            Date_Last_Activity: "",
        }
    }

    refreshList(){
        fetch(variables.API_URL + "users")
        .then(response=>response.json())
        .then(data=>{
            this.setState({users:data});
        });
    }

    componentDidMount(){
        this.refreshList();
    }

    changeUserID =(e)=>{
        this.setState({UserID:e.target.value});
    }

    changeDate_Registration =(e)=>{
        this.setState({Date_Registration:e.target.value});
    }

    changeDate_Last_Activity =(e)=>{
        this.setState({Date_Last_Activity:e.target.value});
    }
    
    addClick(){
        this.setState({
            modalTitle:"Add User",
            UserID:0,
            Date_Registration: "",
            Date_Last_Activity: ""
        });
    }
    editClick(usr){
        this.setState({
            modalTitle:"Edit User",
            UserID:usr.UserID,
            Date_Registration:usr.Date_Registration,
            Date_Last_Activity:usr.Date_Last_Activity
        });
    }

    createClick(){
        if (this.state.users.find(user => user.UserID === this.state.UserID) 
            || typeof +this.state.UserID !== "number" || this.state.Date_Registration === "" 
            || this.state.Date_Last_Activity === "" 
            || new Date(this.state.Date_Registration) > new Date(this.state.Date_Last_Activity)) alert('Failed')
        else {
            fetch(variables.API_URL+'users',{
                method:'POST',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    UserID:this.state.UserID,
                    Date_Registration:this.state.Date_Registration,
                    Date_Last_Activity:this.state.Date_Last_Activity,
                })
            })
            .then(res=>res.json())
            .then((result)=>{
                alert(result);
                this.refreshList();
            },(error)=>{
                alert('Failed');
            })
        }
    }


    updateClick(){
        if (typeof +this.state.UserID !== "number" || this.state.Date_Registration === "" 
            || this.state.Date_Last_Activity === ""
            || new Date(this.state.Date_Registration) > new Date(this.state.Date_Last_Activity)) alert('Failed')
        else {
            fetch(variables.API_URL+'users',{
                method:'PUT',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    UserID:this.state.UserID,
                    Date_Registration:this.state.Date_Registration,
                    Date_Last_Activity:this.state.Date_Last_Activity,
                })
            })
            .then(res=>res.json())
            .then((result)=>{
                alert(result);
                this.refreshList();
            },(error)=>{
                alert('Failed');
            })
        }
    }

    deleteClick(id){
        if(window.confirm('Are you sure?')){
            fetch(variables.API_URL+'users/'+id,{
                method:'DELETE',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                }
            })
            .then(res=>res.json())
            .then((result)=>{
                alert(result);
                this.refreshList();
            },(error)=>{
                alert('Failed');
            })
        }
    }

    calculateClick() {
        function setData(data) {
            let date = new Date(data);
            date.setDate(date.getDate() + 7);
            return date;
        }
        let rollingRetentionSevenDayArr = [];

        let usersArr = this.state.users;

        usersArr.forEach(function (elem) {
            rollingRetentionSevenDayArr.push(Math.round(usersArr.filter(item => new Date(item.Date_Last_Activity) >= setData(elem.Date_Registration)).length
            / usersArr.filter(item => new Date(item.Date_Registration) <= new Date(elem.Date_Registration)).length * 100, 1))
        })

        let rollingRetentionSevenDay = rollingRetentionSevenDayArr.reduce((a, b) => a + b, 0) / rollingRetentionSevenDayArr.length;

        document.getElementById('rr7d').innerText = rollingRetentionSevenDay ? rollingRetentionSevenDay : 0;
        document.getElementById('ch').className = "d-block";
    }


    render() {
        const {
            users,
            modalTitle,
            UserID,
            Date_Registration,
            Date_Last_Activity,
        }=this.state;

        let array = users.map(user => Math.ceil((new Date(user.Date_Last_Activity) - new Date(user.Date_Registration)) 
                                                    / (24 * 3600 * 1000)))
        let step = Math.ceil(Math.max(...array) / 10)
        let lab = new Array(10).fill(1).map((item, i) => 
            JSON.stringify(Math.ceil(item * (i + 1) * step - step + 1)) + " - " + Math.ceil(item * (i + 1) * step ))
        let cntArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let cntArrCopy = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let cntNullDays = 0;

        for (let i = 0; i < array.length; i++) {
            if (array[i] === 0) cntNullDays += 1;
            cntArr[Math.floor((array[i] - 1) / step)] += 1;
            cntArrCopy[Math.floor((array[i] - 1) / step)] += 1;
        }

        lab.unshift(0);
        cntArrCopy.unshift(cntNullDays)
        return(
            <div>
                <span className="d-none">{
                    lab
                }{ cntArrCopy
                }</span>
                <button type="button"
                    className="btn btn-primary m-3 float-start"
                    onClick={()=> this.calculateClick()
                   }>
                        Calculate
                </button>
                <div className="d-none" id="ch">
                    <br/>
                    <h3>Rolling Retention 7 day: <span id="rr7d"></span> %</h3>
                    <br/>
                    <h3>Histogram distribution of user activity duration, days</h3>
                    
                    <Bar  
                        data={{
                            labels:lab,
                            datasets:[{
                                label: 'Users',
                                data: cntArrCopy,
                            }],
                        }}
                    />
                    <h6>Days</h6>

                    <button type="button"
                        className="btn btn-primary m-2 float-start"
                        onClick={()=>document.getElementById('ch').className = "d-none"}>
                            Hide graph
                    </button>
                </div>
                <button type="button"
                    className="btn btn-primary m-2 float-end"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    onClick={()=>this.addClick()}>
                        Add User
                </button>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>
                                UserID
                            </th>
                            <th>
                                Date Registration
                            </th>
                            <th>
                                Date Last Activity
                            </th>
                            <th>
                                Options
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(us => 
                            <tr key={us.UserID}>
                                <td>{us.UserID}</td>
                                <td>{us.Date_Registration}</td>
                                <td>{us.Date_Last_Activity}</td>
                                <td>
                                    <button type="button"
                                        className="btn btn-light mr-1"
                                        data-bs-toggle="modal"
                                        data-bs-target="#exampleModal"
                                        onClick={()=>this.editClick(us)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#5D6D97" className="bi bi-pen" viewBox="0 0 16 16">
                                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                                            </svg>    
                                    </button>

                                    <button type="button"
                                        className="btn btn-light mr-1"
                                        
                                        onClick={()=>this.deleteClick(us.UserID)}>
                                            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5.6 0C5.2346 0 4.858 0.123333 4.5934 0.375333C4.3295 0.626667 4.2 0.985333 4.2 1.33333V2H0V3.33333H0.7V14C0.7 15.0967 1.6485 16 2.8 16H11.2C12.3515 16 13.3 15.0967 13.3 14V3.33333H14V2H9.8V1.33333C9.8 0.985333 9.6705 0.626667 9.4059 0.374667C9.142 0.124 8.7661 0 8.4 0H5.6ZM5.6 1.33333H8.4V2H5.6V1.33333ZM2.1 3.33333H11.9V14C11.9 14.37 11.5885 14.6667 11.2 14.6667H2.8C2.4115 14.6667 2.1 14.37 2.1 14V3.33333ZM3.5 5.33333V12.6667H4.9V5.33333H3.5ZM6.3 5.33333V12.6667H7.7V5.33333H6.3ZM9.1 5.33333V12.6667H10.5V5.33333H9.1Z" fill="#5D6D97"/>
                                            </svg>
                                    </button>
                                </td>
                            </tr>)}
                    </tbody>
                </table>
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{modalTitle}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        ></button>
                    </div>
                <div className="modal-body">
                <div className="d-flex flex-row bd-highlight mb-3">
                
                <div className="p-2 w-50 bd-highlight">
    
                    <div className="input-group mb-3">
                        <span className="input-group-text">UserID</span>
                        <input type="text" className="form-control"
                        value={UserID}
                        onChange={this.changeUserID}/>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Date Registration</span>
                        <input type="date" className="form-control"
                        value={Date_Registration}
                        onChange={this.changeDate_Registration}/>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Date Last Activity</span>
                        <input type="date" className="form-control"
                        value={Date_Last_Activity}
                        onChange={this.changeDate_Last_Activity}/>
                    </div>
                </div>
            </div>
                
            {!users.find(item => item.UserID === UserID)
                ? <button type="button"
                    className="btn btn-primary float-start"
                    onClick={()=>this.createClick()}
                    >Create</button>
                : null}

                {users.find(item => item.UserID === UserID)
                ? <button type="button"
                    className="btn btn-primary float-start"
                    onClick={()=>this.updateClick()}
                    >Update</button>
                : null}
   </div>

</div>
</div> 
</div>
                
</div>
        )
    }
}
