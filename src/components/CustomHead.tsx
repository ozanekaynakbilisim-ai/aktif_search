import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../lib/adminStore';

export default function CustomHead() {
  const settings = useAdminStore(state => state.settings);
  const {
    customHeadScripts,
    googleSearchConsole,
    bingWebmasterTools,
    googleAnalytics,
    googleTagManager,
    facebookPixel,
    customEmbedCodes
  } = settings;

  // Get head position embed codes
  const headEmbeds = customEmbedCodes.filter(embed => embed.enabled && embed.position === 'head');

  return (
    <Helmet>
      {/* Custom Head Scripts */}
      {customHeadScripts && (
        <script type="text/javascript">
          {customHeadScripts}
        </script>
      )}
      
      {/* Webmaster Verification */}
      {googleSearchConsole && (
        <div dangerouslySetInnerHTML={{ __html: googleSearchConsole }} />
      )}
      {bingWebmasterTools && (
        <div dangerouslySetInnerHTML={{ __html: bingWebmasterTools }} />
      )}
      
      {/* Analytics */}
      {googleAnalytics && (
        <div dangerouslySetInnerHTML={{ __html: googleAnalytics }} />
      )}
      {googleTagManager && (
        <div dangerouslySetInnerHTML={{ __html: googleTagManager }} />
      )}
      {facebookPixel && (
        <div dangerouslySetInnerHTML={{ __html: facebookPixel }} />
      )}
      
      {/* Custom Head Embeds */}
      {headEmbeds.map((embed) => (
        <div key={embed.id} dangerouslySetInnerHTML={{ __html: embed.code }} />
      ))}
    </Helmet>
  );
}