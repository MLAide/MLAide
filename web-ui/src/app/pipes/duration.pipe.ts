import { Pipe, PipeTransform } from "@angular/core";
import * as Moment from "moment";

@Pipe({
  name: "duration",
})
export class DurationPipe implements PipeTransform {
  transform(startTime: Date, endTime: Date): string {
    const value = new Date(endTime).getTime() - new Date(startTime).getTime();
    let durationString = "";
    const leftPad = (x) => (String(x).length >= 2 ? x : leftPad(`0${x}`));
    const valueAsMoment = Moment.duration(value);

    // Will need to check for another solution to support i18n

    if (Math.floor(valueAsMoment.asDays()) > 0) {
      durationString += Math.floor(valueAsMoment.asDays()) + "d ";
    }
    if (Math.floor(valueAsMoment.asHours()) > 0) {
      durationString += (Math.floor(valueAsMoment.asHours()) % 24) + "h ";
    }
    if (Math.floor(valueAsMoment.asMinutes()) > 0) {
      durationString += (Math.floor(valueAsMoment.asMinutes()) % 60) + "min ";
    }
    if (Math.floor(valueAsMoment.asSeconds()) > 0) {
      durationString += (Math.floor(valueAsMoment.asSeconds()) % 60) + "s ";
    }

    if (Math.floor(valueAsMoment.asMilliseconds()) > 0) {
      durationString +=
        (Math.floor(valueAsMoment.asMilliseconds()) % 100) + "ms ";
    }

    if (durationString.slice(-1) === " ") {
      durationString = durationString.slice(0, durationString.length - 1);
    }

    return durationString;
  }
}
