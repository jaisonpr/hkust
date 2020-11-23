import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Picker, Switch, Button, Modal, Alert } from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import * as Animatable from 'react-native-animatable';
// import { Permissions, Notifications } from 'expo';
import * as Permissions from 'expo-permissions'


class Reservation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Reserve Table',
    };
  

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        });
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to show notifications');
            }
        }
        return permission;
    }

	async obtainCalendarPermission() {
		let calendarPermission = await Permissions.getAsync(Permissions.CALENDAR);
		if (calendarPermission.status !== 'granted') {
			calendarPermission = await Permissions.askAsync(Permissions.CALENDAR);
			if (calendarPermission.status !== 'granted') {
				Alert.alert('Permission not granted to access calendar');
			}
		}
		return calendarPermission;
	}


	async addReservationToCalendar(date) {
		await this.obtainCalendarPermission();
		Calendar.createEventAsync(Calendar.DEFAULT, {
			title: 'Con Fusion Table Reservation',
			startDate: new Date(Date.parse(date)),
			endDate: new Date(Date.parse(date)).getTime() + (2*60*60*1000),
			timeZone: 'Asia/Hong_Kong',
			location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
		});
	}

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission();
        Notifications.presentLocalNotificationAsync({
            title: 'Your Reservation',
            body: 'Reservation for '+ date + ' requested',
            ios: {
                sound: true
            },
            android: {
                sound: true,
                vibrate: true,
                color: '#512DA8'
            }
        });
    }

    handleReservation() {
        console.log(JSON.stringify(this.state));
        
        const reservation = 
                'Number of Guests ' + this.state.guests +
                '\n Outside? ' + (this.state.outside ? 'Yes' : 'No') +
                '\n Date and Time: ' + this.state.date;
        
        Alert.alert(
            'Your Reservation OK?', reservation,            
			[
				{
					text: 'OK',
					onPress: () => {
						this.presentLocalNotification(this.state.date);
						this.addReservationToCalendar(this.state.date);
						Alert.alert('Your reservation has been added to calendar');
						this.resetForm();
					}
				},
				{
					text: 'Cancel',
					onPress: () => {
						console.log('Reservation Cancelled');
						this.resetForm();
					},
					style: 'cancel'
				}
			],
            { cancelable: false }
        )
    }
    
    render() {
        return(
            <ScrollView>
                <Animatable.View animation='zoomIn' duration={2000}>

                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Number of Guests</Text>
                        <Picker
                            style={styles.formItem}
                            selectedValue={this.state.guests}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ guests: itemValue })
                            } >
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        </Picker>
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Outside/Inside</Text>
                        <Switch
                            style={styles.formItem}
                            value={this.state.outside}
                            trackColor="#51"
                            thumbColor='#512DA8'
                            onValueChange={value => this.setState({ outside: value })} />
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Date and Time</Text>
                        <DatePicker
                            style={{ flex: 2, marginRight: 20 }}
                            date={this.state.date}
                            format=""
                            mode="datetime"
                            placeholder="select date and time"
                            minDate="2020-11-01"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateIcon: {
                                position: "absolute",
                                left: 0,
                                top: 4,
                                marginLeft: 0
                                },
                                dateInput: {
                                marginLeft: 36
                                }
                            }}
                            onDateChange={date => {
                                this.setState({ date: date });
                            }}  />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button
                            style={{ alignSelf: 'stretch' }}
                            title="Reserve"
                            color="#512DA8"
                            onPress={() => this.handleReservation()}
                            accessibilityLabel="Learn more about this purple button" />
                    </View>
                
                </Animatable.View>
            </ScrollView>
        );
    }

};

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },

    modal: {
       justifyContent: 'center',
       margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }
});

export default Reservation;
