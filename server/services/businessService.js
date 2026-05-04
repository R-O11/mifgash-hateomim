const pool = require('../config/db');

class BusinessService {
  async getBusinessStatus() {
    try {
      // 1. Get fundamental business settings
      const settingsResult = await pool.query(
        'SELECT manual_override_mode, delivery_enabled, pickup_enabled, menu_mode, hero_image_url, hero_badge_he, hero_badge_ar, hero_title_he, hero_title_ar, hero_desc_he, hero_desc_ar FROM business_settings LIMIT 1'
      );
      const settingsRows = settingsResult.rows;

      if (settingsRows.length === 0) {
        return { isOpen: true, error: 'No settings found' }; // Fail-safe fallback
      }

      const settings = settingsRows[0];

      // Manual overrides
      if (settings.manual_override_mode === 'force_open') {
        return { isOpen: true, mode: 'force_open', ...settings };
      }
      if (settings.manual_override_mode === 'force_closed') {
        return { isOpen: false, mode: 'force_closed', ...settings };
      }

      // 2. Check special closures for today
      const closureResult = await pool.query(
        'SELECT * FROM special_closures WHERE special_date = CURRENT_DATE'
      );
      const closureRows = closureResult.rows;

      if (closureRows.length > 0) {
        const closure = closureRows[0];
        if (closure.is_closed) {
           return { isOpen: false, mode: 'special_closure', ...settings };
        }

        // If it's a special open duration
        if (closure.open_time && closure.close_time) {
           const timeResult = await pool.query(
             'SELECT (CURRENT_TIME BETWEEN $1 AND $2) AS "isOpenNow"',
             [closure.open_time, closure.close_time]
           );
           return { isOpen: !!timeResult.rows[0].isOpenNow, mode: 'special_hours', ...settings };
        }
      }

      // 3. Fallback to regular hours
      // In PostgreSQL, EXTRACT(DOW FROM ...) returns 0=Sunday...6=Saturday
      const hoursResult = await pool.query(
        `SELECT is_open, open_time, close_time 
         FROM business_hours 
         WHERE day_of_week = EXTRACT(DOW FROM CURRENT_DATE)`
      );
      const hoursRows = hoursResult.rows;

      if (hoursRows.length === 0 || !hoursRows[0].is_open) {
        return { isOpen: false, mode: 'regular_closed_day', ...settings };
      }

      const hours = hoursRows[0];

      // Safely check if time is within open_time and close_time
      const isOpenResult = await pool.query(
        'SELECT (CURRENT_TIME BETWEEN $1 AND $2) AS "isWithinLimits"',
        [hours.open_time, hours.close_time]
      );

      const isOpen = !!isOpenResult.rows[0].isWithinLimits;

      return { isOpen, mode: 'regular_hours', ...settings };
    } catch (error) {
      console.error('Error fetching business status:', error);
      return { isOpen: false, error: 'Internal Server Error Check' };
    }
  }
}

module.exports = new BusinessService();
