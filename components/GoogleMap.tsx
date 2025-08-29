import React from 'react';

const GoogleMap: React.FC = () => {
  return (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.530399435882!2d49.8291423153957!3d40.39697997936746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d4787a4fb21%3A0x335c91f16a7b130!2s142a%20Mirmahmud%20Kazimovski%2C%20Baku%201114%2C%20Azerbaijan!5e0!3m2!1sen!2sus"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Pixel Cyber Zone Location"
      className="absolute inset-0 w-full h-full"
    ></iframe>
  );
};

export default GoogleMap;